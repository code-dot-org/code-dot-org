import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
import TextareaWithImageUpload from '@cdo/apps/lib/levelbuilder/TextareaWithImageUpload';
import sinon from 'sinon';

describe('TextareaWithImageUpload', () => {
  let defaultProps, handleMarkdownChange;
  beforeEach(() => {
    handleMarkdownChange = sinon.spy();
    defaultProps = {
      markdown:
        '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
      handleMarkdownChange
    };
  });

  it('updates markdown', () => {
    const wrapper = mount(<TextareaWithImageUpload {...defaultProps} />);
    expect(wrapper.find('textarea').length).to.equal(1);
    expect(wrapper.find('textarea').props().value).to.equal(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );

    wrapper.find('textarea').simulate('change', {target: {value: '## Title'}});
    expect(handleMarkdownChange).to.have.been.calledOnce;
  });
});
