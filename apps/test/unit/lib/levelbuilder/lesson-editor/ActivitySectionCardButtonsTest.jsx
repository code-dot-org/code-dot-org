import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ActivitySectionCardButtons from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitySectionCardButtons';
import {sampleActivities} from './activitiesTestData';
import sinon from 'sinon';

describe('ActivitySectionCardButtons', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      activitySection: sampleActivities[0].activitySections[1],
      addTip: sinon.spy(),
      editTip: sinon.spy(),
      addLevel: sinon.spy()
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(3);
    expect(wrapper.find('AddResourceDialog').length).to.equal(1);
    expect(wrapper.find('AddLevelDialog').length).to.equal(1);
    expect(wrapper.find('EditTipDialog').length).to.equal(1);
    expect(wrapper.find('TipWithTooltip').length).to.equal(1);
  });
});
