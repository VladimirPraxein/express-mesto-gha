const express = require('express');
const mongoose = require('mongoose');

const cardsRouter = require('./routes/cards');
const usersRouter = require('./routes/users');

const { NotFound } = require('./errors');

const { PORT = 3000 } = process.env;
const URL = 'mongodb://localhost:27017/mestodb';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '63d3bcb55c3f24b48f04617a',
  };

  next();
});

app.use(usersRouter);

app.use(cardsRouter);

app.use('*', (req, res) => {
  res.status(NotFound).send({ message: 'Запрашиваемый ресурс не найден.' });
});

mongoose
  .connect(URL)
  .then(() => console.log('Connetced to MongoDB'))
  .catch((err) => console.log(`DB connection error ${err}`));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
