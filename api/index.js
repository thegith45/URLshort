require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const redis = require('redis');
const urlRoutes = require('./routes/urlRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', urlRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Redis connection
// const redisClient = redis.createClient({ url: process.env.REDIS_URL });
// redisClient.connect().then(() => console.log('Redis connected'));
// app.locals.redis = redisClient;

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
