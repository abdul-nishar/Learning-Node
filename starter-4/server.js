const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Safety net for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED EXCEPTION! 🔴 Shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('DB connection established');
  });

const app = require('./app');

const port = 3000 || process.env.PORT;
const server = app.listen(port, () => {
  console.log(`Listening on ${port}...`);
});

// Safety net for unhandled rejected promises
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 🔴 Shutting down...');
  // server.close waits for the pending requests to complete before exiting the application
  server.close(() => {
    process.exit(1);
  });
});
