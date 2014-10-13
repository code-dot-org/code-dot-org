var url = require('url');
var express = require('express');
var ejs = require('ejs');

var app = express();

app.set('views', __dirname);
app.set('view engine', 'html.ejs');
app.engine('html.ejs', ejs.__express);

var baseUrl = function(req) {
  return req.protocol + '://' + req.get('Host') + '/';
};

app.get('/', function(req, res) {
  res.render('index');
});

var renderApp = function(app, req, res) {
  ['locale', 'level', 'skin', 'dir'].forEach(function(key) {
    if (!req.query[key]) {
      res.end('Expected ' + key + ' query parameter');
      return;
    }
  });
  res.render('app', {
    app: app,
    options: {
      locale: req.query.locale,
      localeDirection: req.query.dir,
      containerId: 'blocklyApp',
      levelId: req.query.level,
      skinId: req.query.skin,
      baseUrl: baseUrl(req),
      cacheBust: false // or 'test-string'
    }
  });
};

app.use(express.static(__dirname + '/public'));

app.get('/blockly/*', function(req, res) {
  res.redirect(req.url.slice(8));
});

app.get('/maze', function(req, res) {
  renderApp('maze', req, res);
});

app.get('/turtle', function(req, res) {
  renderApp('turtle', req, res);
});

app.get('/bounce', function(req, res) {
  renderApp('bounce', req, res);
});

app.get('/flappy', function(req, res) {
  renderApp('flappy', req, res);
});

app.get('/studio', function(req, res) {
  renderApp('studio', req, res);
});

app.get('/jigsaw', function(req, res) {
  renderApp('jigsaw', req, res);
});

app.get('/calc', function(req, res) {
  renderApp('calc', req, res);
});

app.get('/webapp', function(req, res) {
  renderApp('webapp', req, res);
});


module.exports = app;
