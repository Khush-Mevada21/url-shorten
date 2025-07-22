const redis = require('redis');
const { nanoid } = require('nanoid');
require('dotenv').config();

const client = redis.createClient({
    url: process.env.REDIS_URL,
});
client.connect();

const BASE_URL = process.env.BASE_URL;

exports.shortenURL = async (req, res) => {
    const { longUrl } = req.body;

    if (!longUrl) return res.status(400).json({ error: 'URL is required' });

    const shortId = nanoid(6);
    const shortUrl = `${BASE_URL}/${shortId}`;

    await client.set(shortId, longUrl, { EX: 60 }); // expires in 1 min

    res.json({ shortUrl });
};

exports.redirectURL = async (req, res) => {
    const shortId = req.params.shortId;
    const longUrl = await client.get(shortId);

    if (longUrl) return res.redirect(longUrl);
    res.status(404).send('URL not found or expired');
};
