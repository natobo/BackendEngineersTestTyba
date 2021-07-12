const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const { config } = require("../config/config");

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const expires = new Date(Date.now() + config.jwtCookieExpiresIn * 24 * 60 * 60 * 1000);
  const expiresUTC = expires.toUTCString();
  const cookieOptions = {
    expires,
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    expiresUTC,
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError("Must provide email and password!", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) return next(new AppError("Incorrect email or password", 401));

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) token = req.headers.authorization.split(" ")[1];
  else if (req.cookies.jwt) token = req.cookies.jwt;
  if (!token) return next(new AppError("You are not logged in! Please log in to get access", 401));
  const decoded = await promisify(jwt.verify)(token, config.jwtSecret);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next(new AppError("The user belonging to this token does not longer exist.", 401));
  if (currentUser.changedPasswordAfter(decoded.iat)) return next(new AppError("User recently changed password! Please log in again", 401));
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("There is no user with email address.", 404));
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: user.email,
      subject: "Recupera tu contraseña.",
      message: "Hola," + user.name + " ingresa a: http://127.0.0.1:4200/resetpassword/" + resetToken + " para actualizar tu contraseña.",
      html:
        '<h3>Hola</h3><br><br><p>Haz click <a href="http://1270.0.1:4200/resetPassword/"' +
        resetToken +
        '">aquí</a> para actualizar tu contraseña.</p>',
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false,
    });

    return next(new AppError("There was an error sending the email. Try again later!"), 500);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError("Token is invalid or has expired", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) return next(new AppError("Your current password is wrong.", 401));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});