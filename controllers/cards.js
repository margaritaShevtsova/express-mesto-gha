/* eslint-disable no-else-return */
const Card = require('../models/cards');
const { INTERNAL_SERVER_ERROR, VALIDATION_ERROR, NOT_FOUND_ERROR } = require('../utils/constants');

const getCards = (req, res) => Card.find({}).then((cards) => res.send(cards))
  .catch(() => res.status(INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' }));

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  return Card.create({ name, link, owner })
    .then((newCard) => res.status(201).send(newCard))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(VALIDATION_ERROR).send({ message: 'Данные не валидны' });
      } else {
        return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
      }
    });
};

const deleteCard = (req, res) => Card.findByIdAndRemove(req.params.cardId)
  .then((card) => {
    if (!card) {
      return res.status(NOT_FOUND_ERROR).send({ message: 'Карточка не найдена' });
    }
    return res.send({ data: card });
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      return res.status(VALIDATION_ERROR).send({ message: 'Данные не валидны' });
    } else {
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    }
  });

const likeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      return res.status(NOT_FOUND_ERROR).send({ message: 'Карточка не найдена' });
    }
    return res.send({ data: card });
  })
  .catch((err) => {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(VALIDATION_ERROR).send({ message: 'Данные не валидны' });
    } else {
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    }
  });

const dislikeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      return res.status(NOT_FOUND_ERROR).send({ message: 'Карточка не найдена' });
    }
    return res.send({ data: card });
  })
  .catch((err) => {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(VALIDATION_ERROR).send({ message: 'Данные не валидны' });
    } else {
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    }
  });

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
