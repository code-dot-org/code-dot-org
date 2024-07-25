import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';

describe('TextareaWithMarkdownPreview', () => {
  let defaultProps, handleMarkdownChange;
  beforeEach(() => {
    handleMarkdownChange = jest.fn();
    defaultProps = {
      label: 'Section Name',
      markdown:
        '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
      helpTip: 'Helpful information so you know what to do',
      handleMarkdownChange,
    };
  });

  it('has correct markdown for preview of unit description', () => {
    const wrapper = shallow(<TextareaWithMarkdownPreview {...defaultProps} />);
    expect(wrapper.contains('Section Name')).toBe(true);
    expect(wrapper.find('MarkdownEnabledTextarea').length).toBe(1);
    expect(wrapper.find('MarkdownEnabledTextarea').props().markdown).toBe(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );
    expect(wrapper.find('EnhancedSafeMarkdown').length).toBe(1);
    expect(wrapper.find('EnhancedSafeMarkdown').prop('markdown')).toBe(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );

    expect(wrapper.find('HelpTip').length).toBe(1);
  });

  it('has no HelpTip if none passed in to props', () => {
    const wrapper = shallow(
      <TextareaWithMarkdownPreview {...defaultProps} helpTip={null} />
    );

    expect(wrapper.find('HelpTip').length).toBe(0);
  });
});
