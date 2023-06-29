const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const cardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Поле "name" должно быть заполнено'],
      minlength: [2, 'Минимальная длина поля "name" - 2'],
      maxlength: [30, 'Максимальная длина поля "name" - 30'],
    },
    link: {
      type: String,
      required: [true, 'Поле "name" должно быть заполнено'],
      validate: (value) => {
        const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9-._~:/?#@!$&'()*+,;=/]{1,256}#?/;
        return urlRegex.test(value);
      },
    },
    owner: {
      type: ObjectId,
      required: true,
      ref: 'user',
    },
    likes: {
      type: [ObjectId],
      ref: 'user',
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false },
);

module.exports = mongoose.model('card', cardSchema);
