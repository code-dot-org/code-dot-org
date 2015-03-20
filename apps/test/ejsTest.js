// Ensure require('*.ejs') resolves properly
// Also verify nonstandard EJS behavior we rely upon in our templates
var assert = require('chai').assert;

describe("ejs test", function () {
  it("renders empty string on undefined object property access", function () {
    var ejs = require('./ejs/test.ejs')({data:{}});
    assert.equal(ejs, '');
  });

  it("renders ejs through require", function() {
    var ejs = require('./ejs/testRequire');
    assert.equal(ejs, '');
  });

  it("renders ejs through namespaced require", function() {
    var ejs = require('@cdo/apps/test.ejs')({data:{}});
    assert.equal(ejs, '');
  });
});
