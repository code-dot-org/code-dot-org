import {expect} from 'chai';
import React from 'react';
import {mount} from 'enzyme';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';

const DEFAULT_PROPS = {
  label: 'Section Name',
  name: 'name',
  markdown:
    '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
  helpTip: 'Helpful information so you know what to do'
};

describe('TextareaWithMarkdownPreview', () => {
  it('has correct markdown for preview of unit description', () => {
    const wrapper = mount(<TextareaWithMarkdownPreview {...DEFAULT_PROPS} />);
    expect(wrapper.contains('Section Name')).to.be.true;
    expect(wrapper.find('textarea').length).to.equal(1);
    expect(wrapper.find('textarea').prop('defaultValue')).to.equal(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );
    expect(wrapper.find('textarea').prop('name')).to.equal('name');
    expect(wrapper.find('SafeMarkdown').length).to.equal(1);
    expect(wrapper.find('SafeMarkdown').prop('markdown')).to.equal(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );

    expect(wrapper.find('HelpTip').length).to.equal(1);

    wrapper
      .find('textarea[name="name"]')
      .simulate('change', {target: {value: '## Title'}});
    expect(wrapper.find('SafeMarkdown').prop('markdown')).to.equal('## Title');
  });

  it('has no HelpTip if non passed in to props', () => {
    const wrapper = mount(
      <TextareaWithMarkdownPreview {...DEFAULT_PROPS} helpTip={null} />
    );

    expect(wrapper.find('HelpTip').length).to.equal(0);
  });
});
