import {assert} from '../util/deprecatedChai';
// nonstandard EJS behavior we rely upon in our templates
describe('ejs test', function() {
  it('renders empty string on undefined object property access', function() {
    var ejs = require('./empty-data.ejs')({data: {}});
    assert.equal(ejs.trim(), '');
  });
});
