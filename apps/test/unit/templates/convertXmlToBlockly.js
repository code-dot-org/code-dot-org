/** @file Tests for convertXmlToBlockly utility */
import {expect} from '../../util/configuredChai';

import { convertXmlToBlockly } from '@cdo/apps/templates/instructions/utils';

describe('convertXmlToBlockly', function () {
  it('does nothing if there\'s no xml', function () {
    const container = document.createElement('div');
    const content = "<p>Some random content</p>";
    container.innerHTML = content;
    convertXmlToBlockly(container);
    expect(container.innerHTML).to.equal(content);
  });

  it('creates a block space if it detects xml', function () {
    const container = document.createElement('div');
    const content = '<p>Some random content</p><xml><block type="variables_get"><title name="VAR">i</title></block></xml>';
    container.innerHTML = content;
    convertXmlToBlockly(container);
    expect(container.innerHTML).to.not.equal(content);
    expect(container.getElementsByTagName('svg').length).to.equal(2);
  });
});
