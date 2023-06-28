/* eslint-disable no-else-return */
const Card = require('../models/cards');
const ValidationError = require('../errors/validation-err');
const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/not-found-err');

const getCards = (req, res, next) => Card.find({}).then((cards) => res.send(cards))
  .catch(next);

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  return Card.create({ name, link, owner })
    .then((newCard) => res.status(201).send(newCard))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new ValidationError('Данные не валидны'));
      } else {
        next(err);
      }
    });
};

const deleteCard = (req, res, next) => Card.findById(req.params.cardId)
  .then((card) => {
    if (!card) {
      next(new NotFoundError('Карточка не найдена'));
    } else if (!card.owner.equals(req.user._id)) {
      next(new ForbiddenError('Это не ваша карточка'));
    }
    Card.findByIdAndRemove(req.params.cardId);
  })
  .then((card) => res.send({ data: card }))
  .catch((err) => {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      next(new ValidationError('Данные не валидны'));
    } else {
      next(err);
    }
  });

const likeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      next(new NotFoundError('Карточка не найдена'));
    }
    return res.send({ data: card });
  })
  .catch((err) => {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      next(new ValidationError('Данные не валидны'));
    } else {
      next(err);
    }
  });

const dislikeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      next(new NotFoundError('Карточка не найдена'));
    }
    return res.send({ data: card });
  })
  .catch((err) => {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      next(new ValidationError('Данные не валидны'));
    } else {
      next(err);
    }
  });

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
