const request = require('request-promise');
const cheerio = require('cheerio');
const moment = require('moment');
const express = require('express');

require('moment/locale/id');

const app = express();
app.use(express.json());

app.get('/holiday/:year', async (req, res) => {
  try {
    const year = req.params.year;
    const $ = await fetchPublicHolidays(year);
    const holidays = extractHolidays($, year);

    if (!holidays.length)
      return res
        .status(404)
        .json({ success: false, message: 'Data not found' });

    return res.json({
      success: true,
      data: {
        isOfficial: isOfficial($, year),
        count: holidays.length,
        holidays,
      },
    });
  } catch (error) {
    const isNotFoundError = error.message?.match(/^404/);

    if (isNotFoundError)
      return res
        .status(404)
        .json({ success: false, message: 'Data not found' });

    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

app.get('/holiday/:date/check', async (req, res) => {
  try {
    const date = req.params.date;
    const year = moment(date).format('YYYY');
    const $ = await fetchPublicHolidays(year);
    const holidays = extractHolidays($, year);

    if (!holidays.length)
      return res
        .status(404)
        .json({ success: false, message: 'Data not found' });

    const holiday = holidays.find((holiday) => holiday.date === date);

    return res.json({
      success: true,
      data: {
        isHoliday: !!holiday,
        holiday: holiday ? holiday : null,
      },
    });
  } catch (error) {
    const isNotFoundError = error.message?.match(/^404/);

    if (isNotFoundError)
      return res
        .status(404)
        .json({ success: false, message: 'Data not found' });

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

    const $ = await fetchPublicHolidays(year);
    const holidays = extractHolidays($, year);

    if (!holidays.length)
      return res
        .status(404)
        .json({ success: false, message: 'Data not found' });

    const holidaysByMonth = holidays.filter(
      (holiday) => moment(holiday.date).format('MM') === month
    );

    if (!holidaysByMonth.length)
      return res
        .status(404)
        .json({ success: false, message: 'Data not found' });

    return res.json({
      success: true,
      data: {
        isOfficial: isOfficial($, year),
        count: holidaysByMonth.length,
        holidays: holidaysByMonth,
      },
    });
  } catch (error) {
    const isNotFoundError = error.message?.match(/^404/);

    if (isNotFoundError)
      return res
        .status(404)
        .json({ success: false, message: 'Data not found' });

    return res.status(500).json({ success: false, message: error.message });
  }
});

const fetchPublicHolidays = async (year) => {
  const HOLIDAYS_URL = `https://publicholidays.co.id/id/${year}-dates/`;

  const html = await request.get(HOLIDAYS_URL);
  return cheerio.load(html);
};

const extractHolidays = ($, year) => {
  const TABLE_SELECTOR =
    'table.publicholidays.phgtable > tbody > tr.odd, tr.even';

  const publicHolidays = [];

  if (!$(TABLE_SELECTOR).length) return publicHolidays;

  $(TABLE_SELECTOR).each((i, element) => {
    const date = $(element).find('td:nth-child(1)').text().trim();
    const day = $(element).find('td:nth-child(2)').text().trim();
    const name = $(element).find('td:nth-child(3)').text().trim();

    if (isRangeDate(date)) {
      handleRangeDate(date, year).forEach(({ date, day }) => {
        publicHolidays.push({ date, day, name });
      });
    } else {
      publicHolidays.push({
        date: formatDate(date, year),
        day,
        name,
      });
    }
  });

  return publicHolidays;
};

const isOfficial = ($, year) => {
  try {
    const TABLE_SELECTOR =
      'table.publicholidays.phgtable > tbody > tr:last-child';
    return $(TABLE_SELECTOR).find('td[colspan=3] a').length > 0;
  } catch (error) {
    throw new Error(`Failed to extract holidays: ${error.message}`);
  }
};

const formatDate = (date, year) =>
  moment(`${date} ${year}`, 'DD MMMM YYYY').format('YYYY-MM-DD');

const handleRangeDate = (date, year) => {
  const [startDate, endDate] = date.split('to').map((d) => formatDate(d, year));
  const dates = [];
  for (
    let currentDate = moment(startDate);
    currentDate <= moment(endDate);
    currentDate.add(1, 'day')
  ) {
    dates.push({
      date: currentDate.format('YYYY-MM-DD'),
      day: currentDate.format('dddd'),
    });
  }
  return dates;
};

const isRangeDate = (date) => /\bto\b/i.test(date);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
