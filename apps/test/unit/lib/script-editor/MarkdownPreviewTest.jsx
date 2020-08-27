import {expect} from 'chai';
import React from 'react';
import {mount} from 'enzyme';
import MarkdownPreview from '@cdo/apps/lib/script-editor/MarkdownPreview';

const DEFAULT_PROPS = {
  markdown:
    '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
};

describe('ScriptEditor', () => {
  it('has correct markdown for preview of unit description', () => {
    const wrapper = mount(<MarkdownPreview {...DEFAULT_PROPS} />);
    expect(wrapper.find('SafeMarkdown').length).to.equal(1);
    expect(wrapper.find('SafeMarkdown').prop('markdown')).to.equal(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );
  });
});
