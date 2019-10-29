import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';

import {UnconnectedStageCard as StageCard} from '@cdo/apps/lib/script-editor/StageCard';

describe('StageCard', () => {
  let reorderLevel, addLevel, setStageLockable, setFlexCategory, defaultProps;

  beforeEach(() => {
    reorderLevel = sinon.spy();
    addLevel = sinon.spy();
    setStageLockable = sinon.spy();
    setFlexCategory = sinon.spy();
    defaultProps = {
      reorderLevel,
      addLevel,
      setStageLockable,
      setFlexCategory,
      stagesCount: 1,
      stage: {
        levels: [],
        position: 1,
        lockable: false
      }
    };
  });

  it('displays lockable property', () => {
    let wrapper = shallow(<StageCard {...defaultProps} />);
    let labelText = 'Require teachers to unlock this stage';
    let label = wrapper.findWhere(
      n => n.name() === 'label' && n.text().includes(labelText)
    );
    expect(label.find('input').props().checked).to.equal(false);

    const props = {
      ...defaultProps,
      stage: {
        ...defaultProps.stage,
        lockable: true
      }
    };
    wrapper = shallow(<StageCard {...props} />);
    labelText = 'Require teachers to unlock this stage';
    label = wrapper.findWhere(
      n => n.name() === 'label' && n.text().includes(labelText)
    );
    expect(label.find('input').props().checked).to.equal(true);
  });
});
