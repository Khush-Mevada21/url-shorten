const redis = require('redis');
const { nanoid } = require('nanoid');
require('dotenv').config();

const client = redis.createClient({
    url: process.env.REDIS_URL,
});
client.connect();

const BASE_URL = process.env.BASE_URL;

exports.shortenURL = async (req, res) => {
    const { longUrl, customAlias } = req.body;

    if (!longUrl) return res.status(400).json({ error: 'URL is required' });

    const shortId = customAlias || nanoid(6);

    const exists = await client.get(shortId);
    if (exists) {
        return res.status(409).json({ error: 'Alias already are taken' });
    }


    const shortUrl = `${BASE_URL}/${shortId}`;
    function isValidAlias(alias) {
        return /^[a-zA-Z0-9_-]{3,30}$/.test(alias);
    }
    if(!isValidAlias){
        return res.status(400).json({error: 'Alias not valid !'})
    }

    await client.set(shortId, longUrl, { EX: 3600}); // Expires in 1 hour

    res.json({ shortUrl });
};

exports.redirectURL = async (req, res) => {
    const shortId = req.params.shortId;
    const longUrl = await client.get(shortId);

    if (longUrl) return res.redirect(longUrl);
    res.status(404).send('URL not found or expired');
};
