
/**
 * Module dependencies.
 */

var express = require('express')
  , path = require('path')
  , everyauth = require('./app/models/everyauth').init()
  , env = require('./conf/config').env
  , logger = require('./conf/config').logger;

var app = module.exports = express();

// Configuration
app.configure(function() {
  app.set('views', __dirname + '/app/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('htuayreve'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(everyauth.middleware());
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
var server = app.listen(env.PORT);
logger.info("Express server listening", {port: server.address().port, mode: app.get('env')});

// error handling
process.on('uncaughtException', function(err) {
  //logger.debug('Caught exception:', {stackTrack: err.stack || err.message})
});
