const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { urlPattern, idPattern } = require('../utils/constants');

const {
  getUsers, getUser, getMe, updateUserInfo, updateUserAvatar,
} = require('../controllers/users');

usersRouter.get('/users', getUsers);
usersRouter.get('/users/me', getMe);
usersRouter.get(
  '/users/:userId',
  celebrate({
    params: Joi.object().keys({
      userId: Joi.string().required().pattern(idPattern),
    }),
  }),
  getUser,
);
usersRouter.patch(
  '/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().required().min(2).max(30),
    }),
  }),
  updateUserInfo,
);
usersRouter.patch(
  '/users/me/avatar',
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().required().min(2).pattern(urlPattern),
    }),
  }),
  updateUserAvatar,
);

module.exports = usersRouter;
