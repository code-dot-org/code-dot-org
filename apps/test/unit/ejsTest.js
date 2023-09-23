import {assert} from '../util/reconfiguredChai';
import emptyDataEjs from './empty-data.ejs';

// nonstandard EJS behavior we rely upon in our templates
describe('ejs test', function () {
  it('renders empty string on undefined object property access', function () {
    var ejs = emptyDataEjs({data: {}});
    assert.equal(ejs.trim(), '');
  });
});
