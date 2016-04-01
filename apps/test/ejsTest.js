// nonstandard EJS behavior we rely upon in our templates
describe("ejs test", function () {
  it("renders empty string on undefined object property access", function () {
    var ejs = require('ejs').render('<%- data.test %>', {data: {}});
    require('chai').assert.equal(ejs, '');
  });
});
