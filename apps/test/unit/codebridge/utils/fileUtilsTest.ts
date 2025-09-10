import {
  combineStartSourcesAndValidation,
  getFileIconNameAndStyle,
  prepareSourceForLevelbuilderSave,
  ProjectFile,
  shouldShowFile,
} from '@cdo/apps/codebridge';
import {ProjectFileType} from '@cdo/apps/lab2/types';

import {mockAppOptions} from '../test_utils';

const defaultFile: ProjectFile = {
  id: '1',
  name: '',
  language: '',
  contents: '',
  folderId: '',
};

describe('fileUtils', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shoudShowFile is correct in standard mode', () => {
    expect(shouldShowFile(undefined)).toBe(false);
    expect(
      shouldShowFile({...defaultFile, type: ProjectFileType.SYSTEM_SUPPORT})
    ).toBe(false);
    expect(
      shouldShowFile({...defaultFile, type: ProjectFileType.SUPPORT})
    ).toBe(false);
    expect(
      shouldShowFile({...defaultFile, type: ProjectFileType.VALIDATION})
    ).toBe(false);
    expect(
      shouldShowFile({...defaultFile, type: ProjectFileType.STARTER})
    ).toBe(true);
    expect(
      shouldShowFile({...defaultFile, type: ProjectFileType.LOCKED_STARTER})
    ).toBe(true);
    expect(shouldShowFile({...defaultFile, type: undefined})).toBe(true);
  });

  it('shoudShowFile is correct in start mode', () => {
    mockAppOptions({editBlocks: 'start_sources'});
    expect(shouldShowFile(undefined)).toBe(false);
    expect(
      shouldShowFile({...defaultFile, type: ProjectFileType.SYSTEM_SUPPORT})
    ).toBe(false);
    expect(
      shouldShowFile({...defaultFile, type: ProjectFileType.SUPPORT})
    ).toBe(true);
    expect(
      shouldShowFile({...defaultFile, type: ProjectFileType.VALIDATION})
    ).toBe(true);
    expect(
      shouldShowFile({...defaultFile, type: ProjectFileType.STARTER})
    ).toBe(true);
    expect(
      shouldShowFile({...defaultFile, type: ProjectFileType.LOCKED_STARTER})
    ).toBe(true);
    expect(shouldShowFile({...defaultFile, type: undefined})).toBe(true);
  });

  it('shows basic icons in standard mode', () => {
    expect(
      getFileIconNameAndStyle({
        ...defaultFile,
        name: 'test.py',
        type: ProjectFileType.LOCKED_STARTER,
      })
    ).toEqual({iconName: 'python', iconStyle: 'regular', isBrand: true});
    expect(
      getFileIconNameAndStyle({
        ...defaultFile,
        name: 'test.txt',
        type: ProjectFileType.STARTER,
      })
    ).toEqual({iconName: 'file-lines', iconStyle: 'solid', isBrand: false});
    expect(
      getFileIconNameAndStyle({
        ...defaultFile,
        name: 'test.html',
        type: ProjectFileType.STARTER,
      })
    ).toEqual({iconName: 'file-code', iconStyle: 'solid', isBrand: false});
    expect(
      getFileIconNameAndStyle({
        ...defaultFile,
        name: 'test.css',
        type: ProjectFileType.STARTER,
      })
    ).toEqual({iconName: 'css', iconStyle: 'regular', isBrand: true});
    expect(
      getFileIconNameAndStyle({
        ...defaultFile,
        name: 'test.jpg',
        type: ProjectFileType.STARTER,
      })
    ).toEqual({iconName: 'image', iconStyle: 'solid', isBrand: false});
    expect(
      getFileIconNameAndStyle({
        ...defaultFile,
        name: 'test.png',
        type: ProjectFileType.STARTER,
      })
    ).toEqual({iconName: 'image', iconStyle: 'solid', isBrand: false});
    expect(
      getFileIconNameAndStyle({
        ...defaultFile,
        name: 'test.jpeg',
        type: ProjectFileType.STARTER,
      })
    ).toEqual({iconName: 'image', iconStyle: 'solid', isBrand: false});
    expect(
      getFileIconNameAndStyle({
        ...defaultFile,
        name: 'test.csv',
        type: ProjectFileType.STARTER,
      })
    ).toEqual({iconName: 'file-csv', iconStyle: 'solid', isBrand: false});
  });

  it('shows levelbuilder icons in start mode', () => {
    mockAppOptions({editBlocks: 'start_sources'});
    expect(
      getFileIconNameAndStyle({
        ...defaultFile,
        name: 'test.py',
        type: ProjectFileType.VALIDATION,
      })
    ).toEqual({iconName: 'flask', iconStyle: 'solid'});
    expect(
      getFileIconNameAndStyle({
        ...defaultFile,
        name: 'test.txt',
        type: ProjectFileType.SUPPORT,
      })
    ).toEqual({iconName: 'eye-slash', iconStyle: 'regular'});
    expect(
      getFileIconNameAndStyle({
        ...defaultFile,
        type: ProjectFileType.LOCKED_STARTER,
      })
    ).toEqual({iconName: 'lock', iconStyle: 'solid'});
    expect(
      getFileIconNameAndStyle({
        ...defaultFile,
        type: ProjectFileType.STARTER,
      })
    ).toEqual({iconName: 'eye', iconStyle: 'regular'});
  });

  it('correctly filters source for levelbuilder save', () => {
    const source = {
      files: {
        '1': {...defaultFile, type: ProjectFileType.SYSTEM_SUPPORT},
        '2': {...defaultFile, id: '2', type: ProjectFileType.STARTER},
        '3': {
          ...defaultFile,
          id: '3',
          type: ProjectFileType.VALIDATION,
          active: true,
        },
      },
      folders: {},
      openFiles: ['2', '3'],
    };
    const expectedParsedSource = {
      files: {'2': {...defaultFile, id: '2', type: ProjectFileType.STARTER}},
      folders: {},
      openFiles: ['2'],
    };
    expect(prepareSourceForLevelbuilderSave(source)).toEqual({
      parsedSource: expectedParsedSource,
      validationFile: {
        ...defaultFile,
        id: '3',
        active: false,
        type: ProjectFileType.VALIDATION,
      },
    });
  });

  it('correctly combines start sources and validation', () => {
    const startSources = {
      files: {
        '1': {...defaultFile, type: ProjectFileType.STARTER},
      },
      openFiles: ['1'],
      folders: {},
    };

    const validationFile = {
      ...defaultFile,
      type: ProjectFileType.VALIDATION,
      id: '2',
    };

    const expectedCombinedSources = {
      files: {
        '1': {...defaultFile, type: ProjectFileType.STARTER},
        '2': {
          ...defaultFile,
          id: '2',
          type: ProjectFileType.VALIDATION,
        },
      },
      openFiles: ['1', '2'],
      folders: {},
    };

    expect(
      combineStartSourcesAndValidation(startSources, validationFile)
    ).toEqual(expectedCombinedSources);
  });
});
