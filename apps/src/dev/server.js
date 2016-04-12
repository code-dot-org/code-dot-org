var url = require('url');
var express = require('express');
var ejs = require('ejs');
var fs = require('fs');
var httpProxy = require('http-proxy');

var app = express();

app.set('views', __dirname);
app.set('view engine', 'html.ejs');
app.engine('html.ejs', ejs.__express);

var baseUrl = function (req) {
  return req.protocol + '://' + req.get('Host') + '/';
};

app.get('/', function (req, res) {
  res.render('index');
});

app.use('/dev', express.static(__dirname));

app.use('/node_modules', express.static(__dirname + '/../../node_modules'));

var renderApp = function (app, req, res) {
  ['locale', 'level', 'skin', 'dir'].forEach(function (key) {
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
      containerId: 'codeApp',
      levelId: req.query.level,
      skinId: req.query.skin,
      baseUrl: baseUrl(req)
    }
  });
};

app.get('/blockly/*', function (req, res) {
  res.redirect(req.url.slice(8));
});

app.get('/maze', function (req, res) {
  renderApp('maze', req, res);
});

app.get('/turtle', function (req, res) {
  renderApp('turtle', req, res);
});

app.get('/bounce', function (req, res) {
  renderApp('bounce', req, res);
});

app.get('/flappy', function (req, res) {
  renderApp('flappy', req, res);
});

app.get('/craft', function (req, res) {
  renderApp('craft', req, res);
});

app.get('/gamelab', function (req, res) {
  renderApp('gamelab', req, res);
});

app.get('/studio', function (req, res) {
  renderApp('studio', req, res);
});

app.get('/jigsaw', function (req, res) {
  renderApp('jigsaw', req, res);
});

app.get('/calc', function (req, res) {
  renderApp('calc', req, res);
});

app.get('/applab', function (req, res) {
  renderApp('applab', req, res);
});

app.get('/netsim', function (req, res) {
  renderApp('netsim', req, res);
});

// Proxy to locally-running dashboard server for channels api and assets
// (like application.css).  Requires dashboard-server to be running on port 3000.
var dashboardProxy = httpProxy.createProxyServer();
dashboardProxy.on('error', function (e) {
  console.log(e);
  console.log('Use of the dashboard proxy failed.');
  console.log('Please make sure you have dashboard running on port 3000.');
  throw e;
});

app.use('/v3', function (req, res) {
  dashboardProxy.web(req, res, {
    target: req.protocol + '://' + req.hostname + ':3000/v3'
  });
});

app.use('/assets', function (req, res) {
  dashboardProxy.web(req, res, {
    target: req.protocol + '://' + req.hostname + ':3000/assets'
  });
});

module.exports = app;
