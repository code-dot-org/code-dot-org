import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedAddLevelDialogTop as AddLevelDialogTop} from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelDialogTop';
import {searchOptions} from './activitiesTestData';
import sinon from 'sinon';

describe('AddLevelDialogTop', () => {
  let defaultProps, addLevel;
  beforeEach(() => {
    addLevel = sinon.spy();
    defaultProps = {
      addLevel,
      searchOptions: searchOptions
    };
  });

  it('shows filters once finished loading', () => {
    let returnData = {
      data: {
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
        numPages: 1
      }
    };
    let server = sinon.fakeServer.create();
    server.respondWith('GET', '/levels/get_filtered_levels?page=1', [
      200,
      {'Content-Type': 'application/json;charset=UTF-8'},
      JSON.stringify(returnData)
    ]);
    const wrapper = mount(<AddLevelDialogTop {...defaultProps} />);
    server.respond();

    expect(wrapper.find('Connect(ToggleGroup)').length).to.equal(1);
    expect(wrapper.find('Connect(AddLevelFilters)').length).to.equal(1);
    expect(wrapper.find('AddLevelTable').length).to.equal(1);
    expect(wrapper.find('.fa-spin').length).to.equal(0); // no spinner

    server.restore();
  });

  it('getting level data show spinner', () => {
    const wrapper = shallow(<AddLevelDialogTop {...defaultProps} />);

    // Without using setLevels this test has no level data

    expect(wrapper.find('ToggleGroup').length).to.equal(0);
    expect(wrapper.find('Connect(AddLevelFilters)').length).to.equal(0);
    expect(wrapper.find('AddLevelTable').length).to.equal(0);
    expect(wrapper.find('.fa-spin').length).to.equal(1);
  });
});
