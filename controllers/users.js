/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-else-return */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const ConflictError = require('../errors/conflict-err');
const ValidationError = require('../errors/validation-err');
const NotFoundError = require('../errors/not-found-err');
const UnauthorizedError = require('../errors/unauthorized-err');

const getUsers = (req, res, next) => User.find({}).then((users) => res.send(users))
  .catch(next);

const getUser = (req, res, next) => User.findOne(req.user._id)
  .then((user) => {
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }
    return res.send(user);
  })
  .catch((err) => {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      next(new ValidationError('Данные не валидны'));
    } else {
      next(err);
    }
  });

const getUserById = (req, res, next) => {
  const { userId } = req.params;

  return User.findById(userId)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new ValidationError('Данные не валидны'));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
  const {
    email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, name: req.body.name, about: req.body.about, avatar: req.body.avatar,
    }))
    .then((newUser) => res.status(201).send({
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      about: newUser.about,
      avatar: newUser.avatar,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Данные не валидны'));
      } else if (err.code === 11000) {
        next(new ConflictError('Такой пользователь уже существует'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        next(new UnauthorizedError('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            next(new ValidationError('Неправильные почта или пароль'));
          }
          const token = jwt.sign(
            { _id: user._id },
            'some-secret-key',
            { expiresIn: '7d' },
          );
          return res.send({ token });
        });
    })
    .catch(() => {
      next(new UnauthorizedError('Ошибка авторизации'));
    });
};

const editUser = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new ValidationError('Данные не валидны'));
      } else {
        next(err);
      }
    });
};

const editAvatar = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.body.avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new ValidationError('Данные не валидны'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getUsers,
  getUser,
  getUserById,
  createUser,
  editUser,
  editAvatar,
  login,
};
