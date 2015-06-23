Function.prototype.bind = function () {
};

var fs = require('fs');
var page = require('webpage').create();
var path = 'file://' + fs.absolute('blockly_test.html');
console.log(path);
page.open(path, function (status) {
    console.log('Status: ' + status);
    setTimeout(function () {
      page.render('example.png');
      phantom.exit();
    }, 2000);
});

