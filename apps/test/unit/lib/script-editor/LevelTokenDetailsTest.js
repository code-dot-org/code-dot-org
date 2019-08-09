import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedLevelTokenDetails as LevelTokenDetails} from '@cdo/apps/lib/script-editor/LevelTokenDetails';

const levelKeyList = {
  1: 'Level One',
  2: 'Level Two',
  3: 'Level Three',
  4: 'blockly:Studio:playlab_1'
};

const defaultLevel = {
  position: 1,
  ids: [2],
  activeId: 2
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
      chooseLevel,
      addVariant,
      removeVariant,
      setActiveVariant,
      setField,
      level: defaultLevel,
      stagePosition: 5
    };
  });

  it('renders with default props', () => {
    const wrapper = shallow(<LevelTokenDetails {...defaultProps} />);

    assertChecked(wrapper, 'named', false);
    assertChecked(wrapper, 'assessment', false);
    assertChecked(wrapper, 'challenge', false);

    assertButtonVisible(wrapper, 'Add Variant', true);
    assertButtonVisible(wrapper, 'Add Progression', true);
  });
});
