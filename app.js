// Libreria express
const express = require('express');
// Middleware para habilitar CORS (Cross-origin resource sharing) en nuestras rutas o aplicación.
const cors = require('cors');
// Limita conexiones
const rateLimit = require('express-rate-limit');
// Middlewares de seguridad
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

//IMPORTS
const app = express();

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require("./routes/userRouter");

// MIDDLEWARES
app.use(cors());
app.use(helmet());
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(express.json());

// ROUTES
app.use('/api/users', userRouter);

// RUN
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
