const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');
const bodyParser = require('body-parser');

const cardsRouter = require('./routes/cards');
const usersRouter = require('./routes/users');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');

const { urlPattern } = require('./utils/constants');

const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');

const NotFound = require('./errors/notFound');

const { PORT = 3000 } = process.env;
const { URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
mongoose.set('strictQuery', true);

const app = express();
app.use(limiter);
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

mongoose
  .connect(URL)
  .then(() => console.log('Connetced to MongoDB'))
  .catch((err) => console.log(`DB connection error ${err}`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

app.use(cors);

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

app.use(errorLogger);

app.use('*', (req, res, next) => {
  next(new NotFound('Запрашиваемый ресурс не найден.'));
});

app.use(errors());
app.use('/', require('./middlewares/errorHandler'));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
