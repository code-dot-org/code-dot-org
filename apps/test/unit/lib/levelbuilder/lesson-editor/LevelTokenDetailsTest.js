import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedLevelTokenDetails as LevelTokenDetails} from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelTokenDetails';
import _ from 'lodash';

const defaultScriptLevel = {
  id: '10',
  position: 1,
  levels: [
    {
      name: 'Level 1',
      id: '2',
      url: '/fake/url/'
    }
  ],
  activeId: '2',
  expand: true
};

const assertCheckboxVisible = (wrapper, name, visible) => {
  const label = wrapper
    .find('.level-token-checkboxes')
    .findWhere(n => n.name() === 'label' && n.text().includes(name));
  expect(label).to.have.lengthOf(visible ? 1 : 0);
};

const assertChecked = (wrapper, name, checked) => {
  const label = wrapper
    .find('.level-token-checkboxes')
    .findWhere(n => n.name() === 'label' && n.text().includes(name));
  expect(label.find('input').props().checked).to.equal(checked);
};

const assertDisabled = (wrapper, name, disabled) => {
  const label = wrapper
    .find('.level-token-checkboxes')
    .findWhere(n => n.name() === 'label' && n.text().includes(name));
  expect(label.find('input').props().disabled).to.equal(disabled);
};

describe('LevelTokenDetails', () => {
  let setScriptLevelField;
  let defaultProps;
  beforeEach(() => {
    setScriptLevelField = sinon.spy();
    defaultProps = {
      setScriptLevelField,
      scriptLevel: defaultScriptLevel,
      activitySectionPosition: 5,
      activityPosition: 1,
      lessonExtrasAvailableForUnit: false,
      isProfessionalLearningCourse: false,
      inactiveLevelNames: []
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

  it('shows checked checkboxes', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        scriptLevel={{
          ...defaultScriptLevel,
          bonus: true,
          assessment: true,
          challenge: true,
          instructor_in_training: true
        }}
      />
    );
    assertChecked(wrapper, 'Bonus', true);
    assertChecked(wrapper, 'Assessment', true);
    assertChecked(wrapper, 'Challenge', true);
  });

  it('does not show variants by default', () => {
    const wrapper = shallow(<LevelTokenDetails {...defaultProps} />);
    expect(wrapper.text()).not.to.contain('inactive variants');
  });

  it('shows inactive variants when present', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        inactiveLevelNames={['Inactive Level']}
      />
    );
    expect(wrapper.text()).to.contain('inactive variants');
    expect(wrapper.text()).to.contain('Inactive Level');
  });
});
