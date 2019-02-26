const EventEmitter = require('eventemitter3');
const emitter = new EventEmitter();
const { createLogger, format, transports } = require('winston');

// Winston logger configuration
var loggerConfiguration = {
    level: 'silly',  // log all
    format: format.combine(
        format.label({
            // Indica que els logs registrats són de qualsevol dels serveis i userveis de Onion
            label: 'SSE-SERVER'
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


function subscribe(req, res) {

    logger.info('subscribe()');

    res.status(200).set({
        //'content-type': 'text/event-stream', // 'text/event-stream' for browsers
        'content-type': 'application/json', // 'application/json' for node client
        'cache-control': 'no-cache', // just to be on the safe side
        'connection': 'keep-alive' // required
    });

    // Heartbeat
    const nln = function() {
        //res.write('\n');
        res.write(JSON.stringify('hello'));
    };
    const hbt = setInterval(nln, 15000);

    const onEvent = function(data) {
        logger.info('subscribe().onEvent');
        res.write('retry: 500\n');
        res.write(`event: event\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    emitter.on('event', onEvent);

    // Clear heartbeat and listener
    req.on('close', function() {
        logger.info('subscribe().onClose');
        clearInterval(hbt);
        emitter.removeListener('event', onEvent);
    });
}

function publish(eventData) {
    logger.info('publish()');
    // Emit events here
    emitter.emit('event', eventData);
}

module.exports = {
    subscribe, // Sending event data to the clients
    publish // Emiting events from streaming servers
};
