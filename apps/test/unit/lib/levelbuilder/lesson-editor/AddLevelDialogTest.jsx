import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import AddLevelDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelDialog';

import {expect} from '../../../../util/reconfiguredChai';

import {sampleActivities} from './activitiesTestData';

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
      activitySection: sampleActivities[0].activitySections[2],
      allowMajorCurriculumChanges: true,
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddLevelDialog {...defaultProps} />);

    expect(wrapper.contains('Add Levels')).to.be.true;
    expect(wrapper.find('LessonEditorDialog').length).to.equal(1);
    expect(wrapper.find('Connect(AddLevelDialogTop)').length).to.equal(1);
    expect(wrapper.find('Connect(UnconnectedLevelToken)').length).to.equal(2);
    expect(wrapper.find('FontAwesome').length).to.equal(0); // no spinner
  });
});
