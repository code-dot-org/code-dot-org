import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import NetSimLobby from '../../../src/netsim/NetSimLobby.js';
import userSectionClient from '@cdo/apps/util/userSectionClient';

const SIGNED_IN_USER = {
  user: {
    isSignedIn: true,
    name: 'teacher'
  }
};
describe('NetSimLobby', () => {
  it('performs an async request to fetch user sections', () => {
    const getUserSectionsSpy = sinon.spy(userSectionClient, 'getUserSections');
    new NetSimLobby(null, null, SIGNED_IN_USER);
    expect(getUserSectionsSpy).to.have.been.calledOnce;
    userSectionClient.getUserSections.restore();
  });

  it('filters out archived sections', () => {
    const netsimLobby = new NetSimLobby(null, null, SIGNED_IN_USER);
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
  });
});
