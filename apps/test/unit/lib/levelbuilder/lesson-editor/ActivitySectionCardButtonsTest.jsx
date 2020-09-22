import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedActivitySectionCardButtons as ActivitySectionCardButtons} from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitySectionCardButtons';
import {sampleActivities} from './activitiesTestData';
import sinon from 'sinon';

describe('ActivitySectionCardButtons', () => {
  let defaultProps, addTip, updateTip, addLevel, removeTip;
  beforeEach(() => {
    addTip = sinon.spy();
    updateTip = sinon.spy();
    addLevel = sinon.spy();
    removeTip = sinon.spy();
    defaultProps = {
      activitySection: sampleActivities[0].activitySections[1],
      addTip,
      updateTip,
      addLevel,
      removeTip
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(3);
    expect(wrapper.find('AddResourceDialog').length).to.equal(1);
    expect(wrapper.find('AddLevelDialog').length).to.equal(1);
    expect(wrapper.find('LessonTipIconWithTooltip').length).to.equal(1);
    // Don't render this component until add tip button or tip icon are clicked
    expect(wrapper.find('EditTipDialog').length).to.equal(0);
  });
});
