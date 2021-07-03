const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser, checkSession } = require('./middleware/authMiddleware');
const PORT = process.env.PORT;
// Redis 

const session = require('express-session')
const redis = require('redis');
const connectRedis = require('connect-redis')
const redisClient = redis.createClient()
const redisStore = require('connect-redis')(session);

const app = express();


app.use(session({
  secret: 'redisSecret',
  name: 'redisSession',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Note that the cookie-parser module is no longer needed
  store: new redisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 60 * 60 * 1000 }),
}));

// middleware
app.use(express.static('public'));
app.use(express.json())
app.use(cookieParser())

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = process.env.MONGO_URI;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => { app.listen(PORT) 
    console.log('Listening on port', PORT);
  })
  .catch((err) => {}) //console.log(err));

// routes
app.get('*', checkUser)
app.get('/', checkSession, requireAuth, (req, res) => res.render('home'));
app.get('/success', checkSession, requireAuth, (req, res) => res.render('success'));


app.use(authRoutes)