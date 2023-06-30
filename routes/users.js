const router = require('express').Router();
// eslint-disable-next-line import/no-extraneous-dependencies
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUser, getUserById, editUser, editAvatar,
} = require('../controllers/users');

router.get('/users/me', getUser);

router.get('/users', getUsers);

router.patch('/users/me', celebrate(
  {
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      about: Joi.string().min(2).max(30).required(),
    }),
  },
), editUser);

router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24).required(),
  }),
}), getUserById);

router.patch('/users/me/avatar', celebrate(
  {
    body: Joi.object().keys({
      avatar: Joi.string().required().pattern(/^https?:\/\/(www\.)?[-a-zA-Z0-9-._~:/?#@!$&'()*+,;=/]{1,256}#?/),
    }),
  },
), editAvatar);

module.exports = router;
