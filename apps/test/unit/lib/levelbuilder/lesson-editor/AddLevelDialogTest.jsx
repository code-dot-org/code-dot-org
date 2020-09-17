import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import AddLevelDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelDialog';
import {sampleActivities} from './activitiesTestData';
import sinon from 'sinon';

describe('AddLevelDialog', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      isOpen: true,
      handleConfirm: sinon.spy(),
      currentLevels: sampleActivities[0].activitySections[2].levels,
      addLevel: sinon.spy()
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddLevelDialog {...defaultProps} />);
    expect(wrapper.contains('Add Levels'));
    expect(wrapper.find('BaseDialog').length).to.equal(1);
    expect(wrapper.find('ToggleGroup').length).to.equal(1);
    expect(wrapper.find('AddLevelFilters').length).to.equal(1);
    expect(wrapper.find('AddLevelTable').length).to.equal(1);
    //expect(wrapper.find('LevelToken').length).to.equal(2);
  });
});
