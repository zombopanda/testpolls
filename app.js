var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var uuid = require('node-uuid');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var mongoose = require('mongoose');

var routes = require('./routes/index');
var polls = require('./routes/polls');
var admin = require('./routes/admin');

var app = express();

global.config = require("./config");
mongoose.connect(config.dbUri);

var http = require('http').Server(app);
var io = require('socket.io')(http);
global.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'lalalala',
  maxage: 1000 * 60 * 60 * 24 * 14
}));

app.use(function (req, res, next) {
  if (!req.session.uid) {
    req.session.uid = uuid.v1();
  }
  next();
});

app.use('/', routes);
app.use('/polls', polls);
app.use('/admin', admin);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

io.on('connection', function (socket) {
  console.log('a user connected');
});

http.listen(app.get('port') || 3000, function () {
  console.log('listening on *:3000');
});

module.exports = app;
