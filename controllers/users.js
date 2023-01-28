const User = require('../models/user');

const { BadRequest, NotFound, ServerError } = require('../errors');

const getUsers = (req, res) => {
  User
    .find({})
    .then((users) => res.send(users))
    .catch(() => res.status(ServerError).send({ message: 'Произошла ошибка' }));
};

const getUser = (req, res) => {
  const { userId } = req.params;
  return User.findById(userId)
    .then((user) => {
      if (user) {
        return res.send(user);
      }
      return res.status(NotFound).send({ message: 'Пользователь по указанному _id не найден.' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BadRequest).send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.status(ServerError).send({ message: 'Произошла ошибка' });
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  return User.create({ name, about, avatar })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BadRequest).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      }
      return res.status(ServerError).send({ message: 'Произошла ошибка' });
    });
};

const updateUserInfo = (req, res) => {
  const userId = req.user._id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(NotFound).send({ message: 'Передан несуществующий _id.' });
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BadRequest).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      }
      if (err.name === 'CastError') {
        return res.status(BadRequest).send({ message: 'Передан некорректный _id.' });
      }
      return res.status(ServerError).send({ message: 'Произошла ошибка' });
    });
};

const updateUserAvatar = (req, res) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(NotFound).send({ message: 'Передан несуществующий _id.' });
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BadRequest).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
      }
      if (err.name === 'CastError') {
        return res.status(BadRequest).send({ message: 'Передан некорректный _id.' });
      }
      return res.status(ServerError).send({ message: 'Произошла ошибка' });
    });
};

module.exports = {
  getUsers, getUser, createUser, updateUserInfo, updateUserAvatar,
};
