import React from 'react';
import {shallow} from 'enzyme';
import {assert, expect} from '../../../../util/reconfiguredChai';
import {TeacherPanelProgressBubble} from '@cdo/apps/code-studio/components/progress/TeacherPanelProgressBubble';
import color from '@cdo/apps/util/color';
import {LevelKind, LevelStatus} from '@cdo/apps/util/sharedConstants';
import {levelProgressWithStatus} from '@cdo/apps/templates/progress/progressHelpers';

const defaultProps = {
  level: {
    id: 123,
    assessment: null,
    contained: false,
    driver: null,
    isConceptLevel: false,
    levelNumber: 4,
    navigator: null,
    passed: false,
    bonus: false,
    user_id: 1
  },
  levelProgress: levelProgressWithStatus(LevelStatus.not_tried)
};

describe('StudentTable', () => {
  it('shows pair programming logo if level is paired as navigator', () => {
    const wrapper = shallow(
      <TeacherPanelProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          driver: 'My Friend'
        }}
        levelProgress={{...defaultProps.levelProgress, paired: true}}
      />
    );

    expect(wrapper.find('FontAwesome')).to.have.length(1);
  });

  it('shows pair programming logo if level is paired as driver', () => {
    const wrapper = shallow(
      <TeacherPanelProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          navigator: 'My Friend'
        }}
        levelProgress={{...defaultProps.levelProgress, paired: true}}
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
        level={{
          ...defaultProps.level,
          passed: true,
          assessment: false
        }}
        levelProgress={{
          ...defaultProps.levelProgress,
          status: LevelStatus.perfect
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
        level={{
          ...defaultProps.level,
          passed: true,
          kind: LevelKind.assessment
        }}
        levelProgress={{
          ...defaultProps.levelProgress,
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
        levelProgress={{
          ...defaultProps.levelProgress,
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
        level={{
          ...defaultProps.level,
          passed: true
        }}
        levelProgress={{
          ...defaultProps.levelProgress,
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
        level={{
          ...defaultProps.level,
          kind: LevelKind.assessment,
          passed: true
        }}
        levelProgress={{
          ...defaultProps.levelProgress,
          status: LevelStatus.submitted
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
        level={{
          ...defaultProps.level,
          isConceptLevel: true
        }}
      />
    );
    const div = wrapper.find('div').at(1);
    assert.equal(div.props().style.transform, 'rotate(45deg)');
  });
});
