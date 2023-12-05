const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirmation: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();

//   this.password = await bcrypt.hash(this.password, 12);
//   this.passwordConfirmation = undefined;
//   next();
// });

// userSchema.pre('save', function (next) {
//   if (!this.isModified('password') || this.isNew) return next();
//   // Here, we subtrat 1 sec because sometimes this middleware runs before the token is actually created and we need passwordChangedAt to check the expiry time of the token
//   this.passwordChangedAt = Date.now() - 1000;
//   next();
// });

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.passwordVerification = async (
  candidatePassword,
  userPassword,
) => await bcrypt.compare(candidatePassword, userPassword);

userSchema.methods.passwordChanged = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTime = this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changedTime;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // Creating a random string using built-in crypto module
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Encrypting the token to store it in the database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
