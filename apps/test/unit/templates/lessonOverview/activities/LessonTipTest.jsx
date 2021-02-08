import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import LessonTip from '@cdo/apps/templates/lessonOverview/activities/LessonTip';

describe('LessonTip', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      tip: {
        key: 'tip-1',
        type: 'teachingTip',
        markdown: 'Teaching tip content'
      }
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<LessonTip {...defaultProps} />);
    expect(wrapper.contains('Teaching Tip'), 'tip').to.be.true;
    expect(wrapper.find('SafeMarkdown').length).to.equal(1);
    const safeMarkdown = wrapper.find('SafeMarkdown').first();
    expect(safeMarkdown.props().markdown).to.contain('Teaching tip content');
  });

  it('collapses tip when header is pressed', () => {
    const wrapper = shallow(<LessonTip {...defaultProps} />);
    wrapper.find('.unit-test-tip-tab').simulate('click');
    expect(wrapper.find('SafeMarkdown').length).to.equal(0);
  });

  it('expands a collapsed tip when header is pressed', () => {
    const wrapper = shallow(<LessonTip {...defaultProps} />);
    wrapper.instance().setState({expanded: false});
    wrapper.find('.unit-test-tip-tab').simulate('click');
    expect(wrapper.find('SafeMarkdown').length).to.equal(1);
  });
});
