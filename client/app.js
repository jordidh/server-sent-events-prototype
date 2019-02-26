var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var EventSource = require('eventsource');
const { createLogger, format, transports } = require('winston');

// Winston logger configuration
var loggerConfiguration = {
    level: 'silly',  // log all
    format: format.combine(
        format.label({
            // Indica que els logs registrats són de qualsevol dels serveis i userveis de Onion
            label: 'SSE-CLIENT'
        }),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf((info) => {
            return `${info.timestamp} - ${info.label}:[${info.level}]:${info.message}`;
        })
    ),
    transports: [
        // Add Console Logging (the tool pm2 captures the console and logs to a file)
        new transports.Console(),
    ]
};
var logger = createLogger(loggerConfiguration);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

const evtSource = new EventSource('http://localhost:3000/events');

evtSource.addEventListener('event', function(evt) {
  const data = JSON.parse(evt.data);
  logger.info('Event: ' + JSON.stringify(data));
}, false);

/*
evtSource.addEventListener('add', function(evt) {
    const data = JSON.parse(evt.data);
    logger.info('Add: ' + data);
}, false);

evtSource.addEventListener('remove', function(evt) {
    const data = JSON.parse(evt.data);
    logger.info('Remove: ' + data);
}, false);
*/

module.exports = app;
