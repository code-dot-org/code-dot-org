import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import MarkdownEnabledTextarea from '@cdo/apps/lib/levelbuilder/MarkdownEnabledTextarea';
import sinon from 'sinon';

describe('MarkdownEnabledTextarea', () => {
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
    const wrapper = shallow(<MarkdownEnabledTextarea {...defaultProps} />);
    expect(wrapper.find('textarea').length).to.equal(1);
    expect(wrapper.find('textarea').props().value).to.equal(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );

    wrapper.find('textarea').simulate('change', {target: {value: '## Title'}});
    expect(handleMarkdownChange).to.have.been.calledOnce;
  });

  it('selectively enables features', () => {
    const wrapper = shallow(<MarkdownEnabledTextarea {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(0);

    wrapper.setProps({features: {imageUpload: true}});
    expect(
      wrapper
        .find('.btn-toolbar')
        .find('li')
        .map(li => li.text())
    ).to.eql(['Image']);

    wrapper.setProps({features: {resourceLink: true}});
    expect(
      wrapper
        .find('.btn-toolbar')
        .find('li')
        .map(li => li.text())
    ).to.eql(['Resource']);

    wrapper.setProps({features: {imageUpload: true, resourceLink: true}});
    expect(
      wrapper
        .find('.btn-toolbar')
        .find('li')
        .map(li => li.text())
    ).to.eql(['Image', 'Resource']);
  });
});
