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

const defaultLevel = {
  position: 1,
  ids: [2],
  activeId: 2
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

const assertInputVisible = (wrapper, name, visible) => {
  expect(wrapper.find(`input[data-field-name="${name}"]`)).to.have.length(
    visible ? 1 : 0
  );
};

const assertInputValue = (wrapper, name, value) => {
  const input = wrapper.find(`input[data-field-name="${name}"]`);
  expect(input.props().value).to.equal(value);
};

describe('LevelTokenDetails', () => {
  let chooseLevel, addVariant, removeVariant, setActiveVariant, setField;
  let defaultProps;
  beforeEach(() => {
    chooseLevel = sinon.spy();
    addVariant = sinon.spy();
    removeVariant = sinon.spy();
    setActiveVariant = sinon.spy();
    setField = sinon.spy();

    defaultProps = {
      levelKeyList,
      levelNameToIdMap,
      chooseLevel,
      addVariant,
      removeVariant,
      setActiveVariant,
      setField,
      level: defaultLevel,
      lessonPosition: 5,
      lessonGroupPosition: 1
    };
  });

  it('renders with default props', () => {
    const wrapper = shallow(<LevelTokenDetails {...defaultProps} />);

    assertCheckboxVisible(wrapper, 'named', false);
    assertCheckboxVisible(wrapper, 'assessment', true);
    assertCheckboxVisible(wrapper, 'challenge', true);

    assertChecked(wrapper, 'assessment', false);
    assertChecked(wrapper, 'challenge', false);

    assertButtonVisible(wrapper, 'Add Variant', false);
    assertButtonVisible(wrapper, 'Remove Variant', false);

    assertInputVisible(wrapper, 'progression', true);
  });

  it('renders with progression', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        level={{...defaultLevel, progression: 'intro'}}
      />
    );
    assertInputVisible(wrapper, 'progression', true);
    assertInputValue(wrapper, 'progression', 'intro');
  });

  it('shows new blank variant', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        level={{...defaultLevel, ids: [2, -1]}}
      />
    );
    assertButtonVisible(wrapper, 'Add Variant', false);
    assertButtonVisible(wrapper, 'Remove Variant', true);
  });

  it('shows multiple non-blank variants', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        level={{...defaultLevel, ids: [2, 3]}}
      />
    );
    assertButtonVisible(wrapper, 'Add Variant', true);
    assertButtonVisible(wrapper, 'Remove Variant', true);
  });

  it('shows checked checkboxes', () => {
    const wrapper = shallow(
      <LevelTokenDetails
        {...defaultProps}
        level={{
          ...defaultLevel,
          named: true,
          assessment: true,
          challenge: true
        }}
      />
    );
    assertChecked(wrapper, 'named', true);
    assertChecked(wrapper, 'assessment', true);
    assertChecked(wrapper, 'challenge', true);
  });
});
