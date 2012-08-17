
/**
 * Module dependencies.
 */

var express = require('express')
  , everyauth = require('./app/models/everyauth').init()
  , clog = require('clog');

global.clog = clog;
// configure clog
clog.configure({
  'log level': {
    'log': true,
    'info': true,
    'warn': true,
    'error': true,
    'debug': true
  }
});

var app = module.exports = express.createServer();

// Configuration
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'htuayreve'}));
  app.use(everyauth.middleware());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// routes
require('./conf/routes')(app);

// Binding Server
everyauth.helpExpress(app);
app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// error handling
process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err.stack || err.message);
});
