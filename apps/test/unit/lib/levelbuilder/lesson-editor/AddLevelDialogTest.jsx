import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import AddLevelDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelDialog';
import {sampleActivities} from './activitiesTestData';
import sinon from 'sinon';

describe('AddLevelDialog', () => {
  let defaultProps, handleConfirm, addLevel;
  beforeEach(() => {
    handleConfirm = sinon.spy();
    addLevel = sinon.spy();
    defaultProps = {
      isOpen: true,
      handleConfirm,
      addLevel,
      activityPosition: 1,
      activitySection: sampleActivities[0].activitySections[2]
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddLevelDialog {...defaultProps} />);

    expect(wrapper.contains('Add Levels')).to.be.true;
    expect(wrapper.find('LessonEditorDialog').length).to.equal(1);
    expect(wrapper.find('Connect(AddLevelDialogTop)').length).to.equal(1);
    expect(wrapper.find('Connect(LevelToken)').length).to.equal(2);
    expect(wrapper.find('FontAwesome').length).to.equal(0); // no spinner
  });
});
