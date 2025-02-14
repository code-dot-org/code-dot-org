import {renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {
  DEFAULT_FOLDER_ID,
  MAZE_FILE_NAME,
} from '@cdo/apps/codebridge/constants';
import {useInitialSources} from '@cdo/apps/codebridge/hooks';
import lab, {onLevelChange} from '@cdo/apps/lab2/lab2Redux';
import {MazeCell, MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

import {
  neighborhoodLevelProperties,
  nonValidatedLevelProperties,
  smallProjectSources,
  templateBackedLevelProperties,
} from '../test-files';

const expectedParsedDefaultSources = {
  ...smallProjectSources,
  labConfig: undefined,
};

const generateMazeFile = (mazeContents: MazeCell[][], fileId: string) => {
  return {
    id: fileId,
    name: MAZE_FILE_NAME,
    contents: JSON.stringify(mazeContents),
    type: ProjectFileType.SYSTEM_SUPPORT,
    language: 'txt',
    folderId: DEFAULT_FOLDER_ID,
  };
};

describe('useInitialSources', () => {
  let store: Store;
  beforeEach(() => {
    stubRedux();
    registerReducers({
      lab,
    });
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderDefault() {
    const wrapper = ({children}: {children?: React.ReactNode}) => (
      <Provider store={store}>{children}</Provider>
    );
    const {result} = renderHook(() => useInitialSources(smallProjectSources), {
      wrapper,
    });
    const {
      initialSources,
      levelStartSources,
      templateStartSources,
      parsedDefaultSources,
    } = result.current;
    return {
      initialSources,
      levelStartSources,
      templateStartSources,
      parsedDefaultSources,
    };
  }

  it('returns default sources if none are found', () => {
    const {
      initialSources,
      levelStartSources,
      templateStartSources,
      parsedDefaultSources,
    } = renderDefault();
    expect(initialSources).toEqual(expectedParsedDefaultSources);
    expect(levelStartSources).toBeUndefined();
    expect(templateStartSources).toBeUndefined();
    expect(parsedDefaultSources).toEqual(expectedParsedDefaultSources);
  });

  it('returns start sources for a non-template level', () => {
    store.dispatch(
      onLevelChange({levelProperties: nonValidatedLevelProperties})
    );
    const {
      initialSources,
      levelStartSources,
      templateStartSources,
      parsedDefaultSources,
    } = renderDefault();
    const expectedSources = {
      source: nonValidatedLevelProperties.startSources,
      labConfig: undefined,
    };
    expect(initialSources).toEqual(expectedSources);
    expect(levelStartSources).toEqual(expectedSources);
    expect(templateStartSources).toBeUndefined();
    expect(parsedDefaultSources).toEqual(expectedParsedDefaultSources);
  });

  it('returns template sources for a template-backed level', () => {
    store.dispatch(
      onLevelChange({levelProperties: templateBackedLevelProperties})
    );
    const {
      initialSources,
      levelStartSources,
      templateStartSources,
      parsedDefaultSources,
    } = renderDefault();
    const expectedLevelSources = {
      source: templateBackedLevelProperties.startSources,
      labConfig: undefined,
    };
    const expectedSources = {
      source: templateBackedLevelProperties.templateSources,
      labConfig: undefined,
    };
    expect(initialSources).toEqual(expectedSources);
    expect(levelStartSources).toEqual(expectedLevelSources);
    expect(templateStartSources).toEqual(expectedSources);
    expect(parsedDefaultSources).toEqual(expectedParsedDefaultSources);
  });

  it('populates labConfig and serializedMaze for a neighborhood level', () => {
    store.dispatch(
      onLevelChange({levelProperties: neighborhoodLevelProperties})
    );
    const {
      initialSources,
      levelStartSources,
      templateStartSources,
      parsedDefaultSources,
    } = renderDefault();
    const expectedSources = {
      source: {
        ...neighborhoodLevelProperties.startSources,
        files: {
          ...neighborhoodLevelProperties.startSources?.files,
          '1': generateMazeFile(
            neighborhoodLevelProperties.serializedMaze!,
            '1'
          ),
        },
      },
      labConfig: {miniApp: {name: 'neighborhood'}},
    };
    const expectedNeighborhoodDefaultSources = {
      source: {
        ...(expectedParsedDefaultSources.source as MultiFileSource),
        files: {
          ...(expectedParsedDefaultSources.source as MultiFileSource).files,
          '1': generateMazeFile(
            neighborhoodLevelProperties.serializedMaze!,
            '1'
          ),
        },
      },
      labConfig: {miniApp: {name: 'neighborhood'}},
    };
    expect(initialSources).toEqual(expectedSources);
    expect(levelStartSources).toEqual(expectedSources);
    expect(templateStartSources).toBeUndefined();
    expect(parsedDefaultSources).toEqual(expectedNeighborhoodDefaultSources);
  });
});
