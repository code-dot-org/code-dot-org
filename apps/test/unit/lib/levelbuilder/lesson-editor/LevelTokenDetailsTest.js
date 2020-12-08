import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedLevelTokenDetails as LevelTokenDetails} from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelTokenDetails';

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

describe('LevelTokenDetails', () => {
  let setScriptLevelField;
  let defaultProps;
  beforeEach(() => {
    setScriptLevelField = sinon.spy();
    defaultProps = {
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
