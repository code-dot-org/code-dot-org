var chai = require('chai');
var expect = chai.expect;

it('uses jquery', function (done) {
  var $ = require('jquery');
  var div = document.createElement('div');
  $(div).css('background', 'green');
  expect(div.style.background).to.equal('green');
  done();
});
