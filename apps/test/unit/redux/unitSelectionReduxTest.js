import {assert} from '../../util/reconfiguredChai';
import unitSelection, {
  setScriptId,
  getSelectedScriptName,
  getSelectedScriptDescription
} from '@cdo/apps/redux/unitSelectionRedux';

const fakeCourseVersionsWithProgress = {
  1: {
    id: 1,
    key: '2017',
    version_year: '2017',
    content_root_id: 1,
    name: 'Course A',
    path: '/s/coursea-2017',
    type: 'Script',
    is_stable: true,
    is_recommended: false,
    locales: ['العربية', 'Čeština', 'Deutsch', 'English'],
    units: {
      1: {
        id: 1,
        key: 'coursea-2017',
        name: 'Course A',
        path: '/s/coursea-2017',
        lesson_extras_available: true,
        position: null
      }
    }
  },
  2: {
    id: 2,
    key: '2018',
    version_year: '2018',
    content_root_id: 2,
    name: 'Course A',
    path: '/s/coursea-2018',
    type: 'Script',
    is_stable: true,
    is_recommended: true,
    locales: ['English', 'Italiano', 'Slovenčina'],
    units: {
      2: {
        id: 2,
        key: 'coursea-2018',
        name: 'Course A (2018)',
        path: '/s/coursea-2018',
        lesson_extras_available: true,
        position: null
      }
    }
  },
  4: {
    id: 4,
    key: '2018',
    version_year: "'18-'19",
    content_root_id: 51,
    name: 'CS Discoveries 2018',
    path: '/courses/csd-2018',
    type: 'UnitGroup',
    is_stable: true,
    is_recommended: true,
    locales: [],
    units: {
      5: {
        id: 5,
        key: 'csd1-2018',
        name: 'Unit 1',
        path: '/s/csd1-2018',
        lesson_extras_available: false,
        text_to_speech_enabled: false,
        position: 1
      },
      6: {
        id: 6,
        key: 'csd2-2018',
        name: 'Unit 2',
        path: '/s/csd2-2018',
        lesson_extras_available: false,
        text_to_speech_enabled: false,
        position: 2
      }
    }
  },
  6: {
    id: 6,
    key: 'unversioned',
    version_year: 'unversioned',
    content_root_id: 9,
    name: 'Flappy',
    path: '/s/flappy',
    type: 'Script',
    is_stable: true,
    is_recommended: false,
    locales: [],
    units: {
      9: {
        id: 9,
        key: 'flappy',
        name: 'Flappy',
        path: '/s/flappy',
        lesson_extras_available: false,
        text_to_speech_enabled: false,
        position: null,
        description: 'Make a flappy game!'
      }
    }
  }
};

describe('unitSelectionRedux', () => {
  const initialState = unitSelection(undefined, {});

  describe('getSelectedScriptName', () => {
    it('returns the script name of the selected script', () => {
      const state = {
        unitSelection: {
          scriptId: 2,
          courseVersionsWithProgress: fakeCourseVersionsWithProgress
        }
      };
      assert.equal(getSelectedScriptName(state), 'Course A (2018)');
    });

    it('returns null if no script is selected', () => {
      const state = {
        unitSelection: {
          scriptId: null,
          courseVersionsWithProgress: fakeCourseVersionsWithProgress
        }
      };
      assert.equal(getSelectedScriptName(state), null);
    });
  });

  describe('getSelectedScriptDescription', () => {
    it('returns the script description of the selected script', () => {
      const state = {
        unitSelection: {
          scriptId: 9,
          courseVersionsWithProgress: fakeCourseVersionsWithProgress
        }
      };
      assert.equal(getSelectedScriptDescription(state), 'Make a flappy game!');
    });

    it('returns null if no script is selected', () => {
      const state = {
        unitSelection: {
          scriptId: null,
          courseVersionsWithProgress: fakeCourseVersionsWithProgress
        }
      };
      assert.equal(getSelectedScriptDescription(state), null);
    });
  });

  describe('setScriptId', () => {
    it('sets the script id', () => {
      const action = setScriptId(130);
      const nextState = unitSelection(initialState, action);
      assert.deepEqual(nextState.scriptId, 130);
    });
  });
});
