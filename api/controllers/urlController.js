const shortid = require('shortid');
const Url = require('../models/Url');
const Click = require('../models/Click');
const geoip = require('geoip-lite');
const parser = require('ua-parser-js');

exports.shortenUrl = async (req, res) => {
  const { originalUrl } = req.body;
  const shortCode = shortid.generate().slice(0, 6);

  const existing = await Url.findOne({ originalUrl });
  if (existing) return res.json({ shortUrl: `${process.env.BASE_URL}/${existing.shortCode}` });

  await Url.create({ originalUrl, shortCode });
  // await req.app.locals.redis.set(shortCode, originalUrl);
  res.json({ shortUrl: `${process.env.BASE_URL}/${shortCode}` });
};

exports.redirect = async (req, res) => {
  var { shortCode } = req.params;
  // const redis = req.app.locals.redis;

  // let originalUrl = await redis.get(shortCode);
  // if (!originalUrl) {  // if not found in redis then we search in db
  shortCode = shortCode.split("/").pop();
  const doc = await Url.findOne({ shortCode });
  if (!doc) return res.status(404).send('Short URL not found');
  const originalUrl = doc.originalUrl;
  // await redis.set(shortCode, originalUrl);
  // }

  // Log click
  const ip = req.ip;
  const geo = geoip.lookup(ip);
  console.log(geo);
  const ua = parser(req.headers['user-agent']);

  await Click.create({
    shortCode,
    ip,
    country: geo?.country || 'Unknown',
    browser: ua.browser.name,
    device: ua.device.type || 'desktop'
  });

  res.redirect(originalUrl);
};

exports.getAnalytics = async (req, res) => {
  const { shortCode } = req.params;

  const totalClicks = await Click.countDocuments({ shortCode });

  const byCountry = await Click.aggregate([
    { $match: { shortCode } },
    { $group: { _id: '$country', count: { $sum: 1 } } }
  ]);

  const byBrowser = await Click.aggregate([
    { $match: { shortCode } },
    { $group: { _id: '$browser', count: { $sum: 1 } } }
  ]);

  const byDate = await Click.aggregate([
    { $match: { shortCode } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ totalClicks, byCountry, byBrowser, byDate });
};
