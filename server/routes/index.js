var express = require('express');
var router = express.Router();
var events = require('../api/events');
var cors = require('cors');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET send event to a client */
router.get('/send-event', function(req, res, next) {
    events.publish({ missatge:'hola' });
    res.render('index', { title: 'Events sent' });
});

/* GET Server Sent Events URL for web browsers */
// Allow cors only in this route
router.get('/events', cors(), events.subscribe);

module.exports = router;
