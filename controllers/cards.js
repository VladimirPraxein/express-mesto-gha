const Card = require('../models/card');
const { BadRequest, NotFound, ServerError } = require('../errors');

const getCards = (req, res) => {
  Card
    .find({})
    .then((users) => res.send(users))
    .catch(() => res.status(ServerError).send({ message: 'Произошла ошибка' }));
};

const createCard = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  return Card.create({ name, link, owner })
    .then((card) => res.send(card))
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
      if (!card) {
        return res.status(NotFound).send({ message: 'Карточка с указанным _id не найдена.' });
      }
      if (String(card.owner) === owner) {
        return card.remove()
          .then(() => res.send(card));
      }
      return res.status(403).send({ message: 'Невозможно удалить чужую карточку.' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BadRequest).send({ message: 'Передан неккоректный _id.' });
      }
      return res.status(ServerError).send({ message: 'Произошла ошибка' });
    });
};

const likeCard = (req, res) => {
  const { cardId } = req.params;
  return Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        return res.send(card);
      }
      return res.status(NotFound).send({ message: 'Передан несуществующий _id карточки.' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BadRequest).send({ message: 'Передан неккоректный _id.' });
      }
      return res.status(ServerError).send({ message: 'Произошла ошибка' });
    });
};

const dislikeCard = (req, res) => {
  const { cardId } = req.params;
  return Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        return res.send(card);
      }
      return res.status(NotFound).send({ message: 'Передан несуществующий _id карточки.' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BadRequest).send({ message: 'Передан неккоректный _id.' });
      }
      return res.status(ServerError).send({ message: 'Произошла ошибка' });
    });
};

module.exports = {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
};
