import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import sinon from 'sinon';

describe('TextareaWithMarkdownPreview', () => {
  let defaultProps, handleMarkdownChange;
  beforeEach(() => {
    handleMarkdownChange = sinon.spy();
    defaultProps = {
      label: 'Section Name',
      markdown:
        '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
      helpTip: 'Helpful information so you know what to do',
      handleMarkdownChange
    };
  });

  it('has correct markdown for preview of unit description', () => {
    const wrapper = mount(<TextareaWithMarkdownPreview {...defaultProps} />);
    expect(wrapper.contains('Section Name')).to.be.true;
    expect(wrapper.find('textarea').length).to.equal(1);
    expect(wrapper.find('textarea').prop('value')).to.equal(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );
    expect(wrapper.find('SafeMarkdown').length).to.equal(1);
    expect(wrapper.find('SafeMarkdown').prop('markdown')).to.equal(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );

    expect(wrapper.find('HelpTip').length).to.equal(1);

    wrapper.find('textarea').simulate('change', {target: {value: '## Title'}});
    expect(handleMarkdownChange).to.have.been.calledOnce;
  });

  it('has no HelpTip if none passed in to props', () => {
    const wrapper = mount(
      <TextareaWithMarkdownPreview {...defaultProps} helpTip={null} />
    );

    expect(wrapper.find('HelpTip').length).to.equal(0);
  });
});
