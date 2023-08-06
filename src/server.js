require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const db = require('./config/db');
const cors = require('cors');
const userRouter = require('./routes/userRouter');
const moviesRouter = require('./routes/moviesRoute');
const seriesRouter = require('./routes/seriesRouter');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

app.use('/api/auth', userRouter);
app.use('/api/movie', moviesRouter);
app.use('/api/series', seriesRouter);

app.get('/', (req, res) => {
    res.send('Hello, world!');
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
