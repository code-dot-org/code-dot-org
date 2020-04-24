import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';

import {UnconnectedStageCard as StageCard} from '@cdo/apps/lib/script-editor/StageCard';

describe('StageCard', () => {
  let reorderLevel,
    moveLevelToStage,
    addLevel,
    setStageLockable,
    setLessonGroup,
    setTargetStage,
    defaultProps;

  beforeEach(() => {
    reorderLevel = sinon.spy();
    moveLevelToStage = sinon.spy();
    addLevel = sinon.spy();
    setStageLockable = sinon.spy();
    setLessonGroup = sinon.spy();
    setTargetStage = sinon.spy();
    defaultProps = {
      reorderLevel,
      moveLevelToStage,
      addLevel,
      setStageLockable,
      stagesCount: 1,
      stage: {
        levels: [],
        position: 1,
        lockable: false
      },
      stageMetrics: {},
      setLessonGroup,
      setTargetStage,
      targetStagePos: null
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
