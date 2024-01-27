const moment = require('moment');
const express = require('express');
const mongoose = require('mongoose');
const holidayModel = require('./model');

require('dotenv').config();

require('moment/locale/id');

const app = express();
app.use(express.json());

async function connect() {
  try {
    const mongooseUri = process.env.MONGODB_URI;
    await mongoose.connect(mongooseUri);
    console.log('Connect successfully');
  } catch (error) {
    console.error(error);
    console.log('Connect failure');
  }
}

connect();

app.get('/holiday/:year', async (req, res) => {
  try {
    const year = req.params.year;
    const holidays = await fetchPublicHolidays(year);

    if (!holidays)
      return res
        .status(404)
        .json({ success: false, message: 'Data not found' });

    return res.json(response(holidays));
  } catch (error) {
    const isNotFoundError = error.message?.match(/^404/);

    if (isNotFoundError)
      return res
        .status(404)
        .json({ success: false, message: 'Data not found' });

    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/holiday/:date/check', async (req, res) => {
  try {
    const date = req.params.date;
    const year = moment(date).format('YYYY');
    const holidays = await fetchPublicHolidays(year);

    if (!holidays)
      return res
        .status(404)
        .json({ success: false, message: 'Data not found' });

    const holiday = holidays.holidays.find((holiday) => holiday.date === date);

    return res.json({
      success: true,
      data: {
        isHoliday: !!holiday,
        holiday: holiday ? holiday : null,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

app.get('/holiday/:year/:month', async (req, res) => {
  try {
    const year = req.params.year;
    let month = parseInt(req.params.month);
    month = month < 10 ? `0${month}` : month;

    const holidays = await fetchPublicHolidays(year);

    if (!holidays)
      return res
        .status(404)
        .json({ success: false, message: 'Data not found' });

    const holidaysByMonth = holidays.holidays.filter((holiday) => {
      const holidayMonth = moment(holiday.date).format('MM');
      return holidayMonth === month;
    });

    return res.json({
      success: true,
      data: response({
        count: holidaysByMonth.length,
        isOfficial: holidays.isOfficial,
        holidays: holidaysByMonth,
      }),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

const fetchPublicHolidays = async (year) => {
  const holidays = await holidayModel.findOne({ year }).lean();
  return holidays ? holidays : null;
};

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const response = (holidays) => {
  delete holidays._id;
  delete holidays.__v;

  holidays.holidays.map((holiday) => {
    delete holiday._id;
    return holiday;
  });

  return holidays;
};
