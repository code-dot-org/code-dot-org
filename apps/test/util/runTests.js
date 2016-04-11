// Based on the documentation, it seems like npm-which SHOULD look through
// node_modules directories in parents in addition to the current directory.
// In practice, that doesn't seem to happen, so instead I'm hardcoding it's
// current directory to be our root
var which = require('npm-which')(__dirname + '/../..').sync;
var mochify = require('mochify');
var http = require('http');
var fs = require('fs');

var exec = require('child_process').exec;
var command = which('linklocal');

/**
 * Mochify uses phantomic to run a server that it connects to, which serves up
 * the generated bundle. I couldn't find a way to get it to serve up non-bundle
 * code as well. Instead, I'm creating my own server which serves up files
 * from cdo/apps/lib. This way I can script inject some necessary files.
 */
function httpServer(port, callback) {
  var server = http.createServer(function (req, res) {
    var url = req.url;
    var p = url.indexOf('?');
    if (p !== -1) {
      url = url.substring(0, p);
    }

    // navigate from root
    var filepath = __dirname + '/../../..' + url;
    if (!fs.existsSync(filepath)) {
      console.log('404: ' + filepath);
      res.writeHead(404);
      res.end();
    } else {
      res.writeHead(200);
      fs.createReadStream(filepath).pipe(res);
    }
  });
  server.timeout = 0;
  server.listen(port);
  return server;
}

var libServer = httpServer(8001);

exec(command, function (err, stdout, stderr) {
  if (err) {
    console.log(err);
    return;
  }

  var globs = [
    './test/*.js',
    './test/calc/*.js',
    './test/craft/*.js',
    './test/gamelab/*.js',
    './test/netsim/*.js'
  ];

  if (process.env.mocha_entry) {
    globs = [process.env.mocha_entry];
    console.log('restricting to entries: ' + globs);
  }

  var grep = process.env.mocha_grep;
  if (process.argv.indexOf('--fast') !== -1) {
    console.log('Running without maze/turtle level tests.');
    // Load mochaFastMode as an entry point as a way of getting this option
    // into our bundle code.
    globs = ['./test/util/mochaFastMode.js'].concat(globs);
  }

  mochify(globs.join(' '), {
    grep: grep,
    debug: process.env.mocha_debug,
    extension: ['.jsx'],
    invert: process.env.mocha_invert,
    reporter : 'spec',
    timeout: 14000,
    phantomjs: which('phantomjs'),
    transform: 'ejsify',
    'web-security': false
  })
 .on('error', function () {
   console.trace();
   process.exit(1);
  })
  .bundle()
  .on('end', function () {
    libServer.close();
  });
});
