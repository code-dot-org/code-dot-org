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
      lessonExtrasAvailableForScript: false,
      inactiveLevelNames: []
    };
  });

  it('renders with default props', () => {
    const wrapper = shallow(<LevelTokenDetails {...defaultProps} />);

    assertCheckboxVisible(wrapper, 'bonus', true);
    assertCheckboxVisible(wrapper, 'assessment', true);
    assertCheckboxVisible(wrapper, 'challenge', true);

    assertChecked(wrapper, 'bonus', false);
    assertChecked(wrapper, 'assessment', false);
    assertChecked(wrapper, 'challenge', false);
  });

  it('bonus is enabled if lesson extras are not available for script but bonus was already selected', () => {
    let scriptLevel = _.cloneDeep(defaultScriptLevel);
    scriptLevel.bonus = true;
    const wrapper = shallow(
      <LevelTokenDetails {...defaultProps} scriptLevel={scriptLevel} />
    );
    assertDisabled(wrapper, 'bonus', false);
  });

  it('bonus is disabled if lesson extras are not available for script and bonus was not selected', () => {
    const wrapper = shallow(<LevelTokenDetails {...defaultProps} />);
    assertDisabled(wrapper, 'bonus', true);
  });

  it('bonus is enabled if lesson extras are available for script', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        lessonExtrasAvailableForScript={true}
      />
    );
    assertDisabled(wrapper, 'bonus', false);
  });

  it('shows checked checkboxes', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        scriptLevel={{
          ...defaultScriptLevel,
          bonus: true,
          assessment: true,
          challenge: true
        }}
      />
    );
    assertChecked(wrapper, 'bonus', true);
    assertChecked(wrapper, 'assessment', true);
    assertChecked(wrapper, 'challenge', true);
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
