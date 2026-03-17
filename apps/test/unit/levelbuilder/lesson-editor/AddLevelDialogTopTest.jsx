import {isolateComponent} from 'isolate-react';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {UnconnectedAddLevelDialogTop as AddLevelDialogTop} from '@cdo/apps/levelbuilder/lesson-editor/AddLevelDialogTop';

import {assert, expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

import {searchOptions} from './activitiesTestData';

describe('AddLevelDialogTop', () => {
  let defaultProps, addLevel;
  beforeEach(() => {
    addLevel = sinon.spy();
    defaultProps = {
      addLevel,
      searchOptions: searchOptions,
    };
  });

  it('shows filters once finished loading', () => {
    let returnData = {
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
          videoKey: null,
        },
      ],
      numPages: 1,
    };
    let server = sinon.fakeServer.create();
    server.respondWith('GET', '/levels/get_filtered_levels?page=1', [
      200,
      {'Content-Type': 'application/json;charset=UTF-8'},
      JSON.stringify(returnData),
    ]);
    const wrapper = isolateComponent(<AddLevelDialogTop {...defaultProps} />);
    server.respond();

    expect(wrapper.findOne('Connect(ToggleGroup)'));
    expect(wrapper.findOne('Connect(AddLevelFilters)'));
    expect(wrapper.findOne('AddLevelTable'));
    expect(!wrapper.exists('FontAwesome')); // no spinner

    server.restore();
  });

  it('getting level data show spinner', () => {
    const wrapper = isolateComponent(<AddLevelDialogTop {...defaultProps} />);

    // Without using setLevels this test has no level data

    expect(!wrapper.exists('ToggleGroup'));
    expect(!wrapper.exists('Connect(AddLevelFilters)'));
    expect(!wrapper.exists('AddLevelTable'));
    expect(wrapper.exists('FontAwesome'));
    assert.equal(wrapper.findOne('FontAwesome').props.className, 'fa-spin');
  });
});
