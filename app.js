require('dotenv').config();
const express = require('express');
const urlRoutes = require('./routes/urlRoutes')

const app = express();
app.use(express.json());

app.use('/', urlRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
