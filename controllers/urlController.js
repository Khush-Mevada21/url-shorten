const redis = require('redis');
const { nanoid } = require('nanoid');
require('dotenv').config();
const ms = require('ms');


const client = redis.createClient({
    url: process.env.REDIS_URL,
});
client.connect();

const BASE_URL = process.env.BASE_URL;

exports.shortenURL = async (req, res) => {
    const { longUrl, customAlias, expiresIn } = req.body;

    if (!longUrl) return res.status(400).json({ error: 'URL is required' });

    const shortId = customAlias || nanoid(6);

    const exists = await client.get(shortId);
    if (exists) {
        return res.status(409).json({ error: 'Alias already are taken' });
    }


    
    function isValidAlias(alias) {
        return /^[a-zA-Z0-9_-]{3,30}$/.test(alias);
    }

    if (customAlias && !isValidAlias(customAlias)) {
        return res.status(400).json({ error: 'Alias not valid!' });
    }


    let expireSeconds = 3600; // Set Expiry time in 10s, 10m, 1h

    if (expiresIn){
        try{
            if(typeof expiresIn === 'string'){
                expireSeconds = Math.floor(ms(expiresIn) / 1000);

            }
            else if(typeof expiresIn === 'number'){
                expireSeconds = expiresIn
            }
        }
        catch(err){
            return res.status(400).json({error: "Invalid expireIn Format !"})
        }
    }

    if (expireSeconds <= 0) {
        return res.status(400).json({ error: 'Expiration time must be greater than 0' });
    }
    console.log("URL Expires In :", expireSeconds);

    await client.set(shortId, longUrl, { EX: expireSeconds });

    const shortUrl = `${BASE_URL}/${shortId}`;
    res.json({ shortUrl });

    const now = new Date().toISOString();

    await client.hSet(`meta:${shortId}`, {
        clicks: 0,
        createdAt: now,
        lastAccessed: now
    });
    await client.expire(`meta:${shortId}`, expireSeconds);

};

exports.redirectURL = async (req, res) => {
    const shortId = req.params.shortId;
    const longUrl = await client.get(shortId);

    if (!longUrl) {
        return res.status(404).send('URL not found or expired');
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const referrer = req.headers['referer'] || req.headers['referrer'] || 'direct';
    const timestamp = new Date().toISOString();

    await client.hIncrBy(`meta:${shortId}`, 'clicks', 1);
    await client.hSet(`meta:${shortId}`, 'lastAccessed', timestamp);

    await client.lPush(`logs:${shortId}`, JSON.stringify({
        ip,
        userAgent,
        referrer,
        timestamp
    }));

    await client.lTrim(`logs:${shortId}`, 0, 99);

    return res.redirect(longUrl);
};

exports.getStats = async (req, res) => {
    const shortId = req.params.shortId;
    const metaKey = `meta:${shortId}`;

    const longUrl = await client.get(shortId);
    if (!longUrl) {
        return res.status(404).json({ error: 'Short URL not found or expired' });
    }

    const meta = await client.hGetAll(metaKey);

    res.json({
        shortId,
        longUrl,
        clicks: parseInt(meta.clicks || 0),
        createdAt: meta.createdAt || null,
        lastAccessed: meta.lastAccessed || null,
    });
};

exports.getLogs = async (req, res) => {
    const shortId = req.params.shortId;
    const logs = await client.lRange(`logs:${shortId}`, 0, 49); 

    const parsedLogs = logs.map(log => JSON.parse(log));
    res.json({ shortId, logs: parsedLogs });
};
