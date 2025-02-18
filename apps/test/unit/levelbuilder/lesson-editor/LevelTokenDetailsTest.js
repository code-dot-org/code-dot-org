import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import _ from 'lodash';
import React from 'react';

import {UnconnectedLevelTokenDetails as LevelTokenDetails} from '@cdo/apps/levelbuilder/lesson-editor/LevelTokenDetails';

const defaultScriptLevel = {
  id: '10',
  position: 1,
  levels: [
    {
      name: 'Level 1',
      id: '2',
      url: '/fake/url/',
    },
  ],
  activeId: '2',
  expand: true,
};

const assertCheckboxVisible = (wrapper, name, visible) => {
  const label = wrapper
    .find('.level-token-checkboxes')
    .findWhere(n => n.name() === 'label' && n.text().includes(name));
  expect(label).toHaveLength(visible ? 1 : 0);
};

const assertChecked = (wrapper, name, checked) => {
  const label = wrapper
    .find('.level-token-checkboxes')
    .findWhere(n => n.name() === 'label' && n.text().includes(name));
  expect(label.find('input').props().checked).toBe(checked);
};

const assertDisabled = (wrapper, name, disabled) => {
  const label = wrapper
    .find('.level-token-checkboxes')
    .findWhere(n => n.name() === 'label' && n.text().includes(name));
  expect(label.find('input').props().disabled).toBe(disabled);
};

describe('LevelTokenDetails', () => {
  let setScriptLevelField;
  let defaultProps;
  beforeEach(() => {
    setScriptLevelField = jest.fn();
    defaultProps = {
      setScriptLevelField,
      scriptLevel: defaultScriptLevel,
      activitySectionPosition: 5,
      activityPosition: 1,
      lessonExtrasAvailableForUnit: false,
      isProfessionalLearningCourse: false,
      allowMajorCurriculumChanges: true,
      inactiveLevelNames: [],
    };
  });

  it('renders checkboxes for non professional learning course', () => {
    const wrapper = shallow(<LevelTokenDetails {...defaultProps} />);

    assertCheckboxVisible(wrapper, 'Bonus', true);
    assertCheckboxVisible(wrapper, 'Assessment', true);
    assertCheckboxVisible(wrapper, 'Challenge', true);
    assertCheckboxVisible(wrapper, 'Instructor In Training', false);

    assertChecked(wrapper, 'Bonus', false);
    assertChecked(wrapper, 'Assessment', false);
    assertChecked(wrapper, 'Challenge', false);
  });

  it('instructor in training is not shown if not a professional learning course', () => {
    const wrapper = shallow(<LevelTokenDetails {...defaultProps} />);
    assertCheckboxVisible(wrapper, 'Instructor In Training', false);
  });

  it('instructor in training is shown if a professional learning course', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        isProfessionalLearningCourse={true}
      />
    );
    assertCheckboxVisible(wrapper, 'Instructor In Training', true);
  });

  it('bonus is enabled if lesson extras are not available for unit but bonus was already selected', () => {
    let scriptLevel = _.cloneDeep(defaultScriptLevel);
    scriptLevel.bonus = true;
    const wrapper = shallow(
      <LevelTokenDetails {...defaultProps} scriptLevel={scriptLevel} />
    );
    assertDisabled(wrapper, 'Bonus', false);
  });

  it('bonus is disabled if lesson extras are not available for unit and bonus was not selected', () => {
    const wrapper = shallow(<LevelTokenDetails {...defaultProps} />);
    assertDisabled(wrapper, 'Bonus', true);
  });

  it('bonus is enabled if lesson extras are available for unit', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        lessonExtrasAvailableForUnit={true}
      />
    );
    assertDisabled(wrapper, 'Bonus', false);
  });

  it('bonus is disabled if lesson extras are available for unit but major curriculum changes are not allowed', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        allowMajorCurriculumChanges={false}
      />
    );
    assertDisabled(wrapper, 'Bonus', true);
  });

  it('shows checked checkboxes', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        scriptLevel={{
          ...defaultScriptLevel,
          bonus: true,
          assessment: true,
          challenge: true,
          instructor_in_training: true,
        }}
      />
    );
    assertChecked(wrapper, 'Bonus', true);
    assertChecked(wrapper, 'Assessment', true);
    assertChecked(wrapper, 'Challenge', true);
  });

  it('does not show variants by default', () => {
    const wrapper = shallow(<LevelTokenDetails {...defaultProps} />);
    expect(wrapper.text()).not.toContain('inactive variants');
  });

  it('shows inactive variants when present', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        inactiveLevelNames={['Inactive Level']}
      />
    );
    expect(wrapper.text()).toContain('inactive variants');
    expect(wrapper.text()).toContain('Inactive Level');
  });
});
