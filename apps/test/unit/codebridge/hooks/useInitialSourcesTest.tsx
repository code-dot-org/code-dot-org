import {renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {CodebridgeLevelProperties, MazeCell} from '@cdo/apps/codebridge';
import {
  DEFAULT_FOLDER_ID,
  MAZE_FILE_NAME,
} from '@cdo/apps/codebridge/constants';
import {useInitialSources} from '@cdo/apps/codebridge/hooks';
import lab from '@cdo/apps/lab2/lab2Redux';
import {
  MultiFileSource,
  ProjectFile,
  ProjectFileType,
  ProjectSources,
} from '@cdo/apps/lab2/types';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

import {
  neighborhoodLevelProperties,
  nonValidatedLevelProperties,
  noStartSourcesLevelProperties,
  predictLevelProperties,
  smallProject,
  smallProjectSources,
  smallProjectWithOutdatedFormat,
  templateBackedLevelProperties,
  withExemplarLevelProperties,
} from '../test-files';
import {mockAppOptions} from '../test_utils';

const expectedParsedDefaultSources = {
  ...smallProjectSources,
  labConfig: undefined,
};

const sampleInitialSources = {
  source: smallProject,
  labConfig: undefined,
};

const generateMazeFile = (
  mazeContents: MazeCell[][],
  fileId: string
): ProjectFile => {
  return {
    id: fileId,
    name: MAZE_FILE_NAME,
    contents: JSON.stringify(mazeContents),
    type: ProjectFileType.SYSTEM_SUPPORT,
    language: 'txt',
    folderId: DEFAULT_FOLDER_ID,
  };
};

const getExpectedMazeSources = (
  startSources: MultiFileSource | undefined,
  maze: MazeCell[][],
  fileId: string
) => {
  return {
    source: {
      ...startSources,
      files: {
        ...startSources?.files,
        [fileId]: generateMazeFile(maze, fileId),
      },
    },
    labConfig: {miniApp: {name: 'neighborhood'}},
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
    jest.resetAllMocks();
  });

  function renderDefault(
    levelProperties?: CodebridgeLevelProperties,
    initialServerSources?: ProjectSources
  ) {
    const wrapper = ({children}: {children?: React.ReactNode}) => (
      <Provider store={store}>{children}</Provider>
    );
    const {result} = renderHook(
      () =>
        useInitialSources(
          smallProjectSources,
          levelProperties || noStartSourcesLevelProperties,
          initialServerSources
        ),
      {
        wrapper,
      }
    );
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
    const {
      initialSources,
      levelStartSources,
      templateStartSources,
      parsedDefaultSources,
    } = renderDefault(nonValidatedLevelProperties);
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
    const {
      initialSources,
      levelStartSources,
      templateStartSources,
      parsedDefaultSources,
    } = renderDefault(templateBackedLevelProperties);
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
    const {
      initialSources,
      levelStartSources,
      templateStartSources,
      parsedDefaultSources,
    } = renderDefault(neighborhoodLevelProperties);
    const expectedSources = getExpectedMazeSources(
      neighborhoodLevelProperties.startSources,
      neighborhoodLevelProperties.serializedMaze!,
      '1'
    );

    const expectedNeighborhoodDefaultSources = getExpectedMazeSources(
      expectedParsedDefaultSources.source as MultiFileSource,
      neighborhoodLevelProperties.serializedMaze!,
      '1'
    );

    expect(initialSources).toEqual(expectedSources);
    expect(levelStartSources).toEqual(expectedSources);
    expect(templateStartSources).toBeUndefined();
    expect(parsedDefaultSources).toEqual(expectedNeighborhoodDefaultSources);
  });

  it('populates template sources with neighborhood grid', () => {
    const levelProperties = {...neighborhoodLevelProperties};
    levelProperties.templateSources =
      templateBackedLevelProperties.templateSources;
    const {
      initialSources,
      levelStartSources,
      templateStartSources,
      parsedDefaultSources,
    } = renderDefault(levelProperties);
    const expectedLevelSources = getExpectedMazeSources(
      levelProperties.startSources,
      levelProperties.serializedMaze!,
      '1'
    );
    const expectedTemplateSources = getExpectedMazeSources(
      levelProperties.templateSources,
      levelProperties.serializedMaze!,
      '1'
    );
    const expectedNeighborhoodDefaultSources = getExpectedMazeSources(
      expectedParsedDefaultSources.source as MultiFileSource,
      neighborhoodLevelProperties.serializedMaze!,
      '1'
    );
    expect(initialSources).toEqual(expectedTemplateSources);
    expect(levelStartSources).toEqual(expectedLevelSources);
    expect(templateStartSources).toEqual(expectedTemplateSources);
    expect(parsedDefaultSources).toEqual(expectedNeighborhoodDefaultSources);
  });

  it('sets initial sources as lab initial sources if they exist', () => {
    const {
      initialSources,
      levelStartSources,
      templateStartSources,
      parsedDefaultSources,
    } = renderDefault(nonValidatedLevelProperties, sampleInitialSources);

    const expectedStartSources = {
      source: nonValidatedLevelProperties.startSources,
      labConfig: undefined,
    };
    expect(initialSources).toEqual(sampleInitialSources);
    expect(levelStartSources).toEqual(expectedStartSources);
    expect(templateStartSources).toBeUndefined();
    expect(parsedDefaultSources).toEqual(expectedParsedDefaultSources);
  });

  it('sets start sources as initial sources in start mode', () => {
    mockAppOptions({editBlocks: 'start_sources'});

    const {initialSources} = renderDefault(
      nonValidatedLevelProperties,
      sampleInitialSources
    );

    const expectedStartSources = {
      source: nonValidatedLevelProperties.startSources,
      labConfig: undefined,
    };
    expect(initialSources).toEqual(expectedStartSources);
  });

  it('uses exemplar code in exemplar mode', () => {
    mockAppOptions({isEditingExemplar: true});
    const {initialSources} = renderDefault(
      withExemplarLevelProperties,
      sampleInitialSources
    );

    const expectedInitialSources = {
      source: withExemplarLevelProperties.exemplarSources,
      labConfig: undefined,
    };

    expect(initialSources).toEqual(expectedInitialSources);
  });

  it('uses exemplar code in viewing exemplar mode', () => {
    mockAppOptions({isViewingExemplar: true});
    const {initialSources} = renderDefault(
      withExemplarLevelProperties,
      sampleInitialSources
    );

    const expectedInitialSources = {
      source: withExemplarLevelProperties.exemplarSources,
      labConfig: undefined,
    };

    expect(initialSources).toEqual(expectedInitialSources);
  });

  it('does not use exemplar in standard mode', () => {
    const {initialSources} = renderDefault(
      withExemplarLevelProperties,
      sampleInitialSources
    );

    expect(initialSources).toEqual(sampleInitialSources);
  });

  it('updates exemplar with level grid in neighborhood mode', () => {
    const levelProperties = {...neighborhoodLevelProperties};
    levelProperties.exemplarSources = {
      ...withExemplarLevelProperties.exemplarSources!,
      files: {
        ...(
          withExemplarLevelProperties.exemplarSources as
            | MultiFileSource
            | undefined
        )?.files,
        '1': generateMazeFile([[]], '1'),
      },
    };

    mockAppOptions({isViewingExemplar: true});

    const expectedInitialSources = getExpectedMazeSources(
      (withExemplarLevelProperties.exemplarSources as MultiFileSource)!,
      levelProperties.serializedMaze!,
      '1'
    );
    const {initialSources} = renderDefault(levelProperties);

    expect(initialSources).toEqual(expectedInitialSources);
  });

  it('predict levels use start code if code is not editable after submit', () => {
    const {initialSources} = renderDefault(
      predictLevelProperties,
      sampleInitialSources
    );
    const expectedInitialSources = {
      source: predictLevelProperties.startSources,
      labConfig: undefined,
    };
    expect(initialSources).toEqual(expectedInitialSources);
  });

  it('predict levels use initialSources if code is editable after submit', () => {
    const editablePredictLevelProperties = {
      ...predictLevelProperties,
      predictSettings: {
        ...predictLevelProperties.predictSettings,
        isPredictLevel: true,
        codeEditableAfterSubmit: true,
      },
    };

    const {initialSources} = renderDefault(
      editablePredictLevelProperties,
      sampleInitialSources
    );

    expect(initialSources).toEqual(sampleInitialSources);
  });

  it('correctly repairs open files in server sources', () => {
    const outdatedServerSources: ProjectSources = {
      source: smallProjectWithOutdatedFormat,
      labConfig: undefined,
    };
    const {initialSources} = renderDefault(
      nonValidatedLevelProperties,
      outdatedServerSources
    );

    const expectedInitialSources = {
      source: {
        ...smallProjectWithOutdatedFormat,
        openFiles: ['1', '2'],
      },
      labConfig: undefined,
    };

    expect(initialSources).toEqual(expectedInitialSources);
  });

  it('correctly repairs open files in start sources', () => {
    const outdatedLevelProperties = {
      ...nonValidatedLevelProperties,
      startSources: smallProjectWithOutdatedFormat,
    };
    const {initialSources} = renderDefault(outdatedLevelProperties);
    const expectedInitialSources = {
      source: {
        ...smallProjectWithOutdatedFormat,
        openFiles: ['1', '2'],
      },
      labConfig: undefined,
    };
    expect(initialSources).toEqual(expectedInitialSources);
  });
});
