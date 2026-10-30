import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import MarkdownEnabledTextarea from '@cdo/apps/levelbuilder/MarkdownEnabledTextarea';

describe('MarkdownEnabledTextarea', () => {
  let defaultProps, handleMarkdownChange;
  beforeEach(() => {
    handleMarkdownChange = jest.fn();
    defaultProps = {
      markdown:
        '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
      handleMarkdownChange,
    };
  });

  it('updates markdown', () => {
    const wrapper = shallow(<MarkdownEnabledTextarea {...defaultProps} />);
    expect(wrapper.find('textarea').length).toBe(1);
    expect(wrapper.find('textarea').props().value).toBe(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );

    wrapper.find('textarea').simulate('change', {target: {value: '## Title'}});
    expect(handleMarkdownChange).toHaveBeenCalledTimes(1);
  });

  it('selectively enables features', () => {
    const wrapper = shallow(<MarkdownEnabledTextarea {...defaultProps} />);
    expect(wrapper.find('button').length).toBe(0);

    wrapper.setProps({features: {imageUpload: true}});
    expect(
      wrapper
        .find('.btn-toolbar')
        .find('li')
        .map(li => li.text())
    ).toEqual(['Image']);

    wrapper.setProps({features: {resourceLink: true}});
    expect(
      wrapper
        .find('.btn-toolbar')
        .find('li')
        .map(li => li.text())
    ).toEqual(['Resource']);

    wrapper.setProps({features: {imageUpload: true, resourceLink: true}});
    expect(
      wrapper
        .find('.btn-toolbar')
        .find('li')
        .map(li => li.text())
    ).toEqual(['Image', 'Resource']);
  });

  it('does not show toolbar if all features disabled', () => {
    const wrapper = shallow(<MarkdownEnabledTextarea {...defaultProps} />);
    expect(wrapper.find('textarea').length).toBe(1);
    expect(wrapper.find('textarea').props().value).toBe(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );

    wrapper.find('textarea').simulate('change', {target: {value: '## Title'}});
    expect(handleMarkdownChange).toHaveBeenCalledTimes(1);
    expect(wrapper.find('.btn-toolbar')).toHaveLength(0);
  });
});
