const express = require('express');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
// eslint-disable-next-line import/no-extraneous-dependencies
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const { celebrate, Joi, errors } = require('celebrate');
const auth = require('./middlewares/auth');
const cardRouter = require('./routes/cards');
const userRouter = require('./routes/users');
const { login, createUser } = require('./controllers/users');
const { errorHandler } = require('./middlewares/errorHandler');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(helmet());

app.use(bodyParser.json());

app.post('/signin', celebrate(
  {
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  },
), login);
app.post('/signup', celebrate(
  {
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().pattern(/^https?:\/\/(www\.)?[-a-zA-Z0-9-._~:/?#@!$&'()*+,;=/]{1,256}#?/),
    }),
  },
), createUser);

app.use(auth);

app.use(cardRouter, userRouter);

app.use(errors());
app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).send({ message: 'Такой страницы не существует' });
});

app.listen(PORT);
