var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const hbs = require('express-handlebars');
let db = require('./config/connection')
// var fileUpload = require('express-fileupload');
var session = require('express-session')
require('dotenv').config()




var usersRouter = require('./routes/users');
var adminRouter = require('./routes/vendor');
var superAdminRouter = require('./routes/superAdmin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', hbs.engine({
  extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialDir: __dirname + '/views/partials/', helpers: {
    inc: function (value, options) {
      return parseInt(value) + 1;
    }
  }
}))

var Hbs=hbs.create({});
Hbs.handlebars.registerHelper('if_eq', function(a, b, opts) {
  if(a == b) // Or === depending on your needs
      return opts.fn(this);
  else
      return opts.inverse(this);
});



app.use(logger('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(fileUpload());
app.use(bodyParser.json())
app.use(session({
  secret: "Key",
  resave: false,
  cookie: { maxAge: 300000 },
  saveUninitialized: false
}));
app.use((req, res, next) => {
  if (!req.user) {
    res.header("cache-control", "private,no-cache,no-store,must revalidate");
    res.header("Express", "-3");
  }
  next();
});


db.connect((err) => {
  if (err) console.log('Connection Err'+ err);
  else console.log('Dtabase Connected to port 27017');
})

app.use('/', usersRouter);
app.use('/vendor', adminRouter);
app.use('/super_admin', superAdminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  if (req.session.superAdminLogin) {
    let adminPage = true;
    res.render('superAdmin/404')
  } else if (req.session.vendorLogin) {
    res.render('vendor/404')
  } else {
    res.render('user/404', { user: true, username: req.session.user })
  }
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
