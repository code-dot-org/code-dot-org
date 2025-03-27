import $ from 'jquery';

import * as userSectionClient from '@cdo/apps/util/userSectionClient';

import NetSimLobby from '../../../src/netsim/NetSimLobby.js';

var NetSimTestUtils = require('../../util/netsimTestUtils');

const SIGNED_IN_USER = {
  user: {
    isSignedIn: true,
    name: 'teacher',
  },
};

const rootDiv = $('<div>');
const netsim = {
  debouncedResizeFooter: () => {},
  shardChange: {register: () => {}},
  isConnectedToShardID: () => true,
};

describe('NetSimLobby', () => {
  let getUserSectionsStub;

  // Helper function to create a NetSimLobby instance
  const createLobbyWithLevelKey = (levelKey = 'test-level-key') => {
    return new NetSimLobby(rootDiv, netsim, {
      levelKey,
      ...SIGNED_IN_USER,
    });
  };

  beforeEach(() => {
    getUserSectionsStub = jest
      .spyOn(userSectionClient, 'getUserSections')
      .mockClear()
      .mockImplementation();
    NetSimTestUtils.initializeGlobalsToDefaultValues();
  });

  afterEach(() => {
    userSectionClient.getUserSections.mockRestore();
  });

  it('performs an async request to fetch user sections', () => {
    createLobbyWithLevelKey();
    expect(getUserSectionsStub).toHaveBeenCalledTimes(1);
  });

  it('filters out archived sections', () => {
    const netsimLobby = createLobbyWithLevelKey();
    const sectionList = [
      {id: 1, name: 'Course 1', hidden: true},
      {id: 2, name: 'Course 2', hidden: false},
    ];
    netsimLobby.buildShardChoiceList_(sectionList, null);

    expect(netsimLobby.shardChoices_).toHaveLength(1);
    expect(netsimLobby.shardChoices_.map(obj => obj.displayName)).toContain(
      'Course 2'
    );
  });

  describe('makeShardIDFromSeed_', () => {
    const sampleLevelKey = 's-nati-pilot-content-2024-lessons-1-levels-3';
    let lobby;

    beforeEach(() => {
      lobby = createLobbyWithLevelKey(sampleLevelKey);
    });

    it("should return a string starting with 'ns-'", () => {
      const shardID = lobby.makeShardIDFromSeed_('testSeed');
      expect(shardID.startsWith('ns-')).toBe(true);
    });

    it('should return a string no longer than 48 characters with section id seed intact', () => {
      // The md5 hash is 32 characters long.
      // seed is section ID which will be no longer than 13 characters.
      const seed = '0123456789';
      const shardID = lobby.makeShardIDFromSeed_(seed);
      expect(shardID.length).toBeLessThanOrEqual(48);
      expect(shardID.substring(shardID.length - seed.length)).toBe(seed);
    });

    it('should return a string no longer than 48 characters with long shared seed with seed intact', () => {
      // seed has more than 13 characters.
      const seed = 'thisIsAVeryLongSharedShardSeed';
      const shardID = lobby.makeShardIDFromSeed_(seed);
      expect(shardID.length).toBeLessThanOrEqual(48);
      expect(shardID.substring(shardID.length - seed.length)).toBe(seed);
    });

    it('should generate different shard IDs for different seeds', () => {
      const id1 = lobby.makeShardIDFromSeed_('seed1');
      const id2 = lobby.makeShardIDFromSeed_('seed2');
      expect(id1).not.toBe(id2);
    });

    it('should generate different shard IDs for different level keys', () => {
      const lobby1 = createLobbyWithLevelKey(
        's-nati-pilot-content-2024-lessons-1-levels-3'
      );
      const lobby2 = createLobbyWithLevelKey(
        's-nati-pilot-content-2024-lessons-1-levels-4'
      );
      const id1 = lobby1.makeShardIDFromSeed_('sameSeed');
      const id2 = lobby2.makeShardIDFromSeed_('sameSeed');
      expect(id1).not.toBe(id2);
    });

    it('should return the same shard ID for the same levelKey and seed', () => {
      const id1 = lobby.makeShardIDFromSeed_('fixedSeed');
      const id2 = lobby.makeShardIDFromSeed_('fixedSeed');
      expect(id1).toBe(id2);
    });
  });
});
