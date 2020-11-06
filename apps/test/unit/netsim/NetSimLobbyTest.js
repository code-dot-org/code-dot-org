import sinon from 'sinon';
import $ from 'jquery';
import {expect} from '../../util/reconfiguredChai';
import NetSimLobby from '../../../src/netsim/NetSimLobby.js';
import * as userSectionClient from '@cdo/apps/util/userSectionClient';
var NetSimTestUtils = require('../../util/netsimTestUtils');

const SIGNED_IN_USER = {
  user: {
    isSignedIn: true,
    name: 'teacher'
  }
};
describe('NetSimLobby', () => {
  let rootDiv, netsim, getUserSectionsStub;
  beforeEach(function() {
    getUserSectionsStub = sinon.stub(userSectionClient, 'getUserSections');
    NetSimTestUtils.initializeGlobalsToDefaultValues();
    rootDiv = $('<div>');
    netsim = {
      debouncedResizeFooter: () => {},
      shardChange: {register: () => {}},
      isConnectedToShardID: () => {
        return true;
      }
    };
  });

  afterEach(function() {
    userSectionClient.getUserSections.restore();
  });

  it('performs an async request to fetch user sections', () => {
    new NetSimLobby(rootDiv, netsim, SIGNED_IN_USER);
    expect(getUserSectionsStub).to.have.been.calledOnce;
  });

  it('filters out archived sections', () => {
    const netsimLobby = new NetSimLobby(rootDiv, netsim, SIGNED_IN_USER);

    const sectionList = [
      {
        id: 1,
        name: 'Course 1',
        hidden: true
      },
      {
        id: 2,
        name: 'Course 2',
        hidden: false
      }
    ];
    netsimLobby.buildShardChoiceList_(sectionList, null);
    expect(netsimLobby.shardChoices_).to.have.lengthOf(1);
    expect(netsimLobby.shardChoices_.map(obj => obj.displayName)).to.include(
      'Course 2'
    );
  });
});
