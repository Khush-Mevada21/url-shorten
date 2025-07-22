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
};

exports.redirectURL = async (req, res) => {
    const shortId = req.params.shortId;
    const longUrl = await client.get(shortId);

    if (longUrl) return res.redirect(longUrl);
    res.status(404).send('URL not found or expired');
};
