const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const NotFound = require('../errors/notFound');
const BadRequest = require('../errors/badRequest');
const Conflict = require('../errors/conflict');

const User = require('../models/user');

const getUsers = (req, res, next) => {
  User
    .find({})
    .then((users) => res.send(users))
    .catch(next);
};

const getUser = (req, res, next) => {
  const { userId } = req.params;
  return User.findById(userId)
    .then((user) => {
      if (user) {
        return res.send(user);
      }
      throw new NotFound('Пользователь по указанному _id не найден.');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Передан невалидный _id пользователя.'));
      } else {
        next(err);
      }
    });
};

const getMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      }
      throw new NotFound('Пользователь по указанному _id не найден.');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Передан невалидный _id пользователя.'));
      } else {
        next(err);
      }
    });
};

const createUser = async (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        next(new Conflict('Такой пользователь уже существует.'));
      } else {
        bcrypt
          .hash(password, 10)
          .then((hash) => User.create({
            name, about, avatar, email, password: hash,
          }))
          .then((user) => res.send({
            name: user.name,
            about: user.about,
            avatar: user.avatar,
            email: user.email,
            _id: user._id,
          }));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при создании пользователя.'));
      } else {
        next(err);
      }
    });
};

const updateUserInfo = (req, res, next) => {
  const userId = req.user._id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        next(new NotFound('Передан несуществующий _id.'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при обновлении профиля.'));
      } else {
        next(err);
      }
    });
};

const updateUserAvatar = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        next(new NotFound('Передан несуществующий _id.'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при обновлении аватара.'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(next);
};

module.exports = {
  getUsers, getUser, createUser, updateUserInfo, updateUserAvatar, login, getMe,
};
