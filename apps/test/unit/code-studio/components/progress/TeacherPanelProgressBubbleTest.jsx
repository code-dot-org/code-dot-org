import React from 'react';
import {shallow} from 'enzyme';
import {assert, expect} from '../../../../util/reconfiguredChai';
import {TeacherPanelProgressBubble} from '@cdo/apps/code-studio/components/progress/TeacherPanelProgressBubble';
import color from '@cdo/apps/util/color';
import {LevelKind, LevelStatus} from '@cdo/apps/util/sharedConstants';

const defaultProps = {
  userLevel: {
    id: 123,
    assessment: null,
    contained: false,
    driver: null,
    isConceptLevel: false,
    levelNumber: 4,
    navigator: null,
    paired: false,
    passed: false,
    bonus: false,
    status: LevelStatus.not_tried,
    user_id: 1
  }
};

describe('StudentTable', () => {
  it('shows pair programming logo if level is paired as navigator', () => {
    const wrapper = shallow(
      <TeacherPanelProgressBubble
        {...defaultProps}
        userLevel={{
          ...defaultProps.userLevel,
          paired: true,
          driver: 'My Friend'
        }}
      />
    );

    expect(wrapper.find('FontAwesome')).to.have.length(1);
  });

  it('shows pair programming logo if level is paired as driver', () => {
    const wrapper = shallow(
      <TeacherPanelProgressBubble
        {...defaultProps}
        userLevel={{
          ...defaultProps.userLevel,
          paired: true,
          navigator: 'My Friend'
        }}
      />
    );

    expect(wrapper.find('FontAwesome')).to.have.length(1);
  });

  it('shows number in bubble if not paired and not bonus', () => {
    const wrapper = shallow(<TeacherPanelProgressBubble {...defaultProps} />);

    expect(wrapper.find('FontAwesome')).to.have.length(0);
    assert(wrapper.containsMatchingElement(<span>{4}</span>));
  });

  it('has a green background when we have perfect status and not assessment', () => {
    const wrapper = shallow(
      <TeacherPanelProgressBubble
        {...defaultProps}
        userLevel={{
          ...defaultProps.userLevel,
          passed: true,
          status: LevelStatus.perfect,
          assessment: false
        }}
      />
    );

    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_perfect);
  });

  it('has a purple background when level status is LevelStatus.completed_assessment, is an assessment level', () => {
    const wrapper = shallow(
      <TeacherPanelProgressBubble
        {...defaultProps}
        userLevel={{
          ...defaultProps.userLevel,
          passed: true,
          kind: LevelKind.assessment,
          status: LevelStatus.completed_assessment
        }}
      />
    );

    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_submitted);
  });

  it('has green border and white background for in progress level', () => {
    const wrapper = shallow(
      <TeacherPanelProgressBubble
        {...defaultProps}
        userLevel={{
          ...defaultProps.userLevel,
          status: LevelStatus.attempted
        }}
      />
    );
    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_not_tried);
    assert.equal(div.props().style.borderColor, color.level_perfect);
  });

  it('has a green border and light green background for too many blocks level', () => {
    const wrapper = shallow(
      <TeacherPanelProgressBubble
        {...defaultProps}
        userLevel={{
          ...defaultProps.userLevel,
          passed: true,
          status: LevelStatus.passed
        }}
      />
    );
    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_passed);
    assert.equal(div.props().style.borderColor, color.level_perfect);
  });

  it('has a purple background for submitted level', () => {
    const wrapper = shallow(
      <TeacherPanelProgressBubble
        {...defaultProps}
        userLevel={{
          ...defaultProps.userLevel,
          kind: LevelKind.assessment,
          status: LevelStatus.submitted,
          passed: true
        }}
      />
    );
    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_submitted);
    assert.equal(div.props().style.borderColor, color.level_submitted);
    assert.equal(div.props().style.color, color.white);
  });

  it('renders a diamond for concept levels', () => {
    const wrapper = shallow(
      <TeacherPanelProgressBubble
        {...defaultProps}
        userLevel={{
          ...defaultProps.userLevel,
          isConceptLevel: true
        }}
      />
    );
    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.transform, 'rotate(45deg)');
  });
});
