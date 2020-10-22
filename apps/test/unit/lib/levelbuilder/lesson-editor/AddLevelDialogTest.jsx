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
      currentScriptLevels: sampleActivities[0].activitySections[2].scriptLevels,
      addLevel,
      activityPosition: 1,
      activitySectionPosition: 3
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddLevelDialog {...defaultProps} />);

    wrapper.setState({
      levels: [
        {
          conceptDifficulty: '',
          concepts: '',
          icon: 'fa fa-list-ul',
          id: 22300,
          is_concept_level: false,
          kind: 'puzzle',
          name: 'csd-pulse-check-survey-1-levelgroup U6Ch1_2018_2019_2020',
          owner: null,
          skin: null,
          sublevels: null,
          title: null,
          type: 'LevelGroup',
          unplugged: false,
          updated_at: '10/20/20 at 01:30:16 PM',
          url: '/levels/22300/edit',
          videoKey: null
        }
      ],
      numPages: 1,
      searchFields: {
        levelOptions: [['All Types', ''], ['Applab', 'Applab']],
        scriptOptions: [['All Scripts', ''], ['my-script', 'my-script']],
        ownerOptions: [['All Owners', ''], ['Levelbuilder', 'Levelbuilder']]
      },
      levelType: '',
      scriptId: '',
      ownerId: ''
    });

    expect(wrapper.contains('Add Levels')).to.be.true;
    expect(wrapper.find('BaseDialog').length).to.equal(1);
    expect(wrapper.find('ToggleGroup').length).to.equal(1);
    expect(wrapper.find('AddLevelFilters').length).to.equal(1);
    expect(wrapper.find('AddLevelTable').length).to.equal(1);
    expect(wrapper.find('Connect(LevelToken)').length).to.equal(2);
    expect(wrapper.find('FontAwesome').length).to.equal(0); // no spinner
  });

  it('getting level data show spinner', () => {
    const wrapper = shallow(<AddLevelDialog {...defaultProps} />);

    // Without the setState there is no level data in this test

    expect(wrapper.contains('Add Levels')).to.be.true;
    expect(wrapper.find('BaseDialog').length).to.equal(1);
    expect(wrapper.find('ToggleGroup').length).to.equal(0);
    expect(wrapper.find('AddLevelFilters').length).to.equal(0);
    expect(wrapper.find('AddLevelTable').length).to.equal(0);
    expect(wrapper.find('Connect(LevelToken)').length).to.equal(2);
    expect(wrapper.find('FontAwesome').length).to.equal(1);
  });
});
