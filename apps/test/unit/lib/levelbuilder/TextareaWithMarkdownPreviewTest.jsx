import {expect} from 'chai';
import React from 'react';
import {mount} from 'enzyme';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';

const DEFAULT_PROPS = {
  label: 'Section Name',
  name: 'name',
  markdown:
    '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
};

describe('TextareaWithMarkdownPreview', () => {
  it('has correct markdown for preview of unit description', () => {
    const wrapper = mount(<TextareaWithMarkdownPreview {...DEFAULT_PROPS} />);
    expect(wrapper.contains('Section Name'));
    expect(wrapper.find('textarea').length).to.equal(1);
    expect(wrapper.find('textarea').prop('defaultValue')).to.equal(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );
    expect(wrapper.find('textarea').prop('name')).to.equal('name');
    expect(wrapper.find('SafeMarkdown').length).to.equal(1);
    expect(wrapper.find('SafeMarkdown').prop('markdown')).to.equal(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );
  });
});
