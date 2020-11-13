import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedLevelTokenDetails as LevelTokenDetails} from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelTokenDetails';

const levelKeyList = {
  1: 'Level One',
  2: 'Level Two',
  3: 'Level Three',
  4: 'blockly:Studio:playlab_1'
};

const levelNameToIdMap = {
  'Level One': 1,
  'Level Two': 2,
  'Level Three': 3,
  'blockly:Studio:playlab_1': 4
};

const defaultScriptLevel = {
  id: 10,
  position: 1,
  levels: [
    {
      name: 'Level 1',
      id: 2,
      url: '/fake/url/'
    }
  ],
  activeId: 2,
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

const assertButtonVisible = (wrapper, name, visible) => {
  const button = (
    <button type="button">
      <i />
      {name}
    </button>
  );
  expect(wrapper.containsMatchingElement(button)).to.equal(visible);
};

describe('LevelTokenDetails', () => {
  let chooseLevel,
    addVariant,
    removeVariant,
    setActiveVariant,
    setLevelField,
    setScriptLevelField;
  let defaultProps;
  beforeEach(() => {
    chooseLevel = sinon.spy();
    addVariant = sinon.spy();
    removeVariant = sinon.spy();
    setActiveVariant = sinon.spy();
    setLevelField = sinon.spy();
    setScriptLevelField = sinon.spy();

    defaultProps = {
      levelKeyList,
      levelNameToIdMap,
      chooseLevel,
      addVariant,
      removeVariant,
      setActiveVariant,
      setLevelField,
      setScriptLevelField,
      scriptLevel: defaultScriptLevel,
      activitySectionPosition: 5,
      activityPosition: 1
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

    assertButtonVisible(wrapper, 'Add Variant', true);
    assertButtonVisible(wrapper, 'Remove Variant', false);
  });

  it('shows new blank variant', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        scriptLevel={{
          ...defaultScriptLevel,
          levels: [
            {id: 2, name: 'Name 1', url: '/this/url'},
            {id: -1, name: 'Name 2', url: '/that/url'}
          ]
        }}
      />
    );
    //assertButtonVisible(wrapper, 'Add Variant', false);
    assertButtonVisible(wrapper, 'Remove Variant', true);
  });

  it('shows multiple non-blank variants', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        scriptLevel={{
          ...defaultScriptLevel,
          levels: [
            {id: 2, name: 'Name 1', url: '/this/url'},
            {id: 3, name: 'Name 2', url: '/that/url'}
          ]
        }}
      />
    );
    //assertButtonVisible(wrapper, 'Add Variant', true);
    assertButtonVisible(wrapper, 'Remove Variant', true);
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
});
