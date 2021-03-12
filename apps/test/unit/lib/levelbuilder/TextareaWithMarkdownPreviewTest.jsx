import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
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
    const wrapper = shallow(<TextareaWithMarkdownPreview {...defaultProps} />);
    expect(wrapper.contains('Section Name')).to.be.true;
    expect(wrapper.find('MarkdownEnabledTextarea').length).to.equal(1);
    expect(wrapper.find('MarkdownEnabledTextarea').props().markdown).to.equal(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );
    expect(wrapper.find('EnhancedSafeMarkdown').length).to.equal(1);
    expect(wrapper.find('EnhancedSafeMarkdown').prop('markdown')).to.equal(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );

    expect(wrapper.find('HelpTip').length).to.equal(1);
  });

  it('has no HelpTip if none passed in to props', () => {
    const wrapper = shallow(
      <TextareaWithMarkdownPreview {...defaultProps} helpTip={null} />
    );

    expect(wrapper.find('HelpTip').length).to.equal(0);
  });
});
