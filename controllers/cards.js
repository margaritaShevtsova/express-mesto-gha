/* eslint-disable no-else-return */
const Card = require('../models/cards');

const getCards = (req, res) => Card.find({}).then((cards) => res.status(200).send(cards))
  .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  return Card.create({ name, link, owner })
    .then((newCard) => res.status(201).send(newCard))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Данные не валидны' });
      } else {
        return res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};

const deleteCard = (req, res) => Card.findByIdAndRemove(req.params.cardId)
  .then((card) => {
    if (!card) {
      return res.status(404).send({ message: 'Карточка не найдена' });
    }
    return res.status(200).send({ data: card });
  })
  .catch(() => {
    if (req.params.cardId.length < 24) {
      return res.status(400).send({ message: 'Данные не валидны' });
    } else {
      return res.status(500).send({ message: 'Произошла ошибка' });
    }
  });

const likeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      return res.status(404).send({ message: 'Карточка не найдена' });
    }
    return res.status(200).send({ data: card });
  })
  .catch((err) => {
    if (err.name === 'ValidationError' || req.params.cardId < 24) {
      return res.status(400).send({ message: 'Данные не валидны' });
    } else {
      return res.status(500).send({ message: 'Произошла ошибка' });
    }
  });

const dislikeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      return res.status(404).send({ message: 'Карточка не найдена' });
    }
    return res.status(200).send({ data: card });
  })
  .catch((err) => {
    if (err.name === 'ValidationError' || req.params.cardId < 24) {
      return res.status(400).send({ message: 'Данные не валидны' });
    } else {
      return res.status(500).send({ message: 'Произошла ошибка' });
    }
  });

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
