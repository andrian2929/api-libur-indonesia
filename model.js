const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const holidaysSchema = new Schema({
  date: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const holidaySchema = new Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    isOfficial: {
      type: Boolean,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    holidays: [holidaysSchema],
  },
  {
    versionKey: false,
  }
);

const Holiday = mongoose.model('Holiday', holidaySchema);

module.exports = Holiday;
