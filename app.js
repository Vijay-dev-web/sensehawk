const express = require('express');
const mongoose = require('mongoose');
const { publicRoutes } = require('./routes/publicRoutes')
const { privateRoutes } = require('./routes/privateRoutes')
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser, checkSession } = require('./middleware/authMiddleware');

console.log("--------------")
console.log("PORT =>", process.env.PORT)
console.log("--------------")


const app = express();
app.set('port', (process.env.PORT || 3000));

// middleware
app.use(express.static('public'));
app.use(express.json())
app.use(cookieParser())

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = process.env.MONGO_URI;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => {
    console.log('Mongo connection established...');
    app.listen(app.get('port'), function() {
        console.log('App is running, server is listening on port ', app.get('port'));
    })
  })
  .catch((err) => {
    console.log(err)
  }) //console.log(err));

// routes
// app.get('*', checkUser)
app.use(publicRoutes)
app.use(privateRoutes)

app.get('/*', requireAuth, (req, res) => {
  // TODO: find the path and redirect accordingly
  res.render('home')
});
