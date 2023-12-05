const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY_TIME,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRY_TIME * 24 * 60 * 60 * 1000,
    ),
    // Cookies can only be sent and received not modified
    httpOnly: true,
  };

  // the secure options makes sure that the cookie is only valid via https requests
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    user: user,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
    photo: req.body.photo,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please enter email and password', 400));
  }
  // 2) Check if user exists
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.passwordVerification(password, user.password))) {
    return next(new AppError('Please enter a valid email or password', 401));
  }
  // 3) If everything verifies, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) Check if token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError('You are not logged in. Please log in to access this.', 401),
    );

  // 2) Verifying the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Checking if user still exists i.e user is deleted or not
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('User to which this token belongs no longer exists', 401),
    );
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.passwordChanged(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again.', 401),
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // 1) Checking for cookies
  if (!req.cookies.jwt) return next();

  // 2) Verifying the token
  const decoded = await promisify(jwt.verify)(
    req.cookies.jwt,
    process.env.JWT_SECRET,
  );

  // 3) Checking if user still exists i.e user is deleted or not
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next();
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.passwordChanged(decoded.iat)) {
    return next();
  }
  // Storing current user in the locals object
  res.locals.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action.', 403),
      );

    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with this email address', 404));

  // 2) Generate a random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email address
  const resetUrl = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this message.`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your reset password token expires in 10 minutes. Please hurry!',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Password reset token has been sent to your email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Please try later.',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If user exists and token has not expired, change the password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirmation = req.body.passwordConfirmation;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  // 3) Log the user in and send JWT token
  createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user._id).select('+password');
  // 2) Check if POSTED current password is correct
  if (
    !user ||
    !(await user.passwordVerification(req.body.passwordCurrent, user.password))
  )
    return next(new Error('Incorrect email or password'));
  // 3) If so, change password
  user.password = req.body.newPassword;
  user.passwordConfirmation = req.body.newPasswordConfirmation;
  await user.save();
  // // 4) Login user
  createSendToken(user, 201, res);
});
