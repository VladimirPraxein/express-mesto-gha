const Card = require('../models/card');

const BadRequest = 400;
const NotFound = 404;
const ServerError = 500;

const getCards = (req, res) => {
  Card
    .find({})
    .then((users) => res.status(200).send(users))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

const createCard = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  return Card.create({ name, link, owner })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BadRequest).send({ message: 'Переданы некорректные данные при создании карточки.' });
      }
      return res.status(ServerError).send({ message: 'Произошла ошибка' });
    });
};

const deleteCard = (req, res) => {
  const owner = req.user._id;
  const { cardId } = req.params;
  return Card.findById(cardId)
    .then((card) => {
      if (String(card.owner) === owner) {
        card.remove();
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(NotFound).send({ message: 'Карточка с указанным _id не найдена.' });
      }
      return res.status(ServerError).send({ message: 'Произошла ошибка' });
    });
};

const likeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BadRequest).send({ message: 'Переданы некорректные данные для постановки для постановки лайка.' });
      }
      if (err.name === 'CastError') {
        return res.status(NotFound).send({ message: 'Передан несуществующий _id карточки.' });
      }
      return res.status(ServerError).send({ message: 'Произошла ошибка' });
    });
};

const dislikeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BadRequest).send({ message: 'Переданы некорректные данные для постановки для снятии лайка.' });
      }
      if (err.name === 'CastError') {
        return res.status(NotFound).send({ message: 'Передан несуществующий _id карточки.' });
      }
      return res.status(ServerError).send({ message: 'Произошла ошибка' });
    });
};

module.exports = {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
};