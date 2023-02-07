const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');

const cardsRouter = require('./routes/cards');
const usersRouter = require('./routes/users');

const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');

const NotFound = require('./errors/notFound');

const { PORT = 3000 } = process.env;
const URL = 'mongodb://localhost:27017/mestodb';

const urlPattern = /^https?:\/\/(\w+:?\w*@)?(\S+(?::\S*))(:[0-9]+)?(\/|\/([\w#!:.?+=&%@\-/]))?/;

const app = express();
app.use(express.json());

app.post('/signin', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().min(2).pattern(urlPattern),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().min(2).pattern(urlPattern),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }).unknown(true),
}), createUser);

app.use(auth);

app.use(usersRouter);

app.use(cardsRouter);

app.use('*', (req, res, next) => {
  next(new NotFound('Запрашиваемый ресурс не найден.'));
});

app.use(errors());
app.use('/', require('./middlewares/errorHandler'));

mongoose
  .connect(URL)
  .then(() => console.log('Connetced to MongoDB'))
  .catch((err) => console.log(`DB connection error ${err}`));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
