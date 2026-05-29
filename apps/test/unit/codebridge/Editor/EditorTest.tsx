import {Editor} from '@codebridge/Editor/Editor';
import {render} from '@testing-library/react';
import React from 'react';

import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';

let mockAiTutorDisabled = false;

let mockState: {
  lab2Project: {
    projectSources: {
      source: {
        files: {
          [key: string]: {
            id: string;
            name: string;
            active: boolean;
            contents: string;
            folderId: string;
          };
        };
        folders: Record<string, never>;
        openFiles: string[];
      };
    };
    viewingAiTutorVersion: boolean;
    projectSourceBeforeAiTutorVersion?: undefined;
  };
};

jest.mock('@codebridge/codebridgeContext', () => ({
  useCodebridgeContext: jest.fn(() => ({
    levelProperties: {appName: 'weblab2'},
    aiTutorDisabled: mockAiTutorDisabled,
  })),
}));

jest.mock('@cdo/apps/util/experiments', () => ({
  __esModule: true,
  default: {
    I18N_TRACKING: 'i18n-tracking',
    ACCEPT_REJECT_UNIFIED_DIFF: 'accept-reject-unified-diff',
    ACCEPT_REJECT_SPLIT_DIFF: 'accept-reject-split-diff',
    isEnabled: jest.fn(() => false),
    isEnabledAllowingQueryString: jest.fn(() => false),
    getEnabledExperiments: jest.fn(() => []),
  },
}));

jest.mock('@cdo/apps/lab2/views/components/editor/CodeEditor', () =>
  jest.fn(() => null)
);

jest.mock('@cdo/apps/aichat/redux', () => ({
  sendAnalytics: jest.fn(),
}));

jest.mock('@cdo/apps/aichat/redux/slice', () => ({
  addItemToUserAddedSelectionContext: jest.fn(),
}));

jest.mock('@cdo/apps/util/reduxHooks', () => ({
  ...jest.requireActual('@cdo/apps/util/reduxHooks'),
  useAppSelector: (
    selector: (
      state: typeof mockState
    ) =>
      | typeof mockState.lab2Project.projectSources.source
      | boolean
      | undefined
  ) => selector(mockState),
  useAppDispatch: () => jest.fn(),
}));

describe('Editor AI tutor affordance', () => {
  beforeEach(() => {
    mockState = {
      lab2Project: {
        projectSources: {
          source: {
            files: {
              '1': {
                id: '1',
                name: 'index.html',
                active: true,
                contents: '<h1>hello</h1>',
                folderId: '0',
              },
            },
            folders: {},
            openFiles: ['1'],
          },
        },
        viewingAiTutorVersion: false,
        projectSourceBeforeAiTutorVersion: undefined,
      },
    };
    mockAiTutorDisabled = false;
    (CodeEditor as jest.Mock).mockClear();
  });

  it('adds the AI tutor selection field when AI tutor is enabled', () => {
    render(<Editor langMapping={{}} editableFileTypes={['html']} />);

    const props = (CodeEditor as jest.Mock).mock.calls[0][0];
    expect(props.editorConfigExtensions).toHaveLength(1);
  });

  it('does not add the AI tutor selection field when AI tutor is disabled', () => {
    mockAiTutorDisabled = true;

    render(<Editor langMapping={{}} editableFileTypes={['html']} />);

    const props = (CodeEditor as jest.Mock).mock.calls[0][0];
    expect(props.editorConfigExtensions).toHaveLength(0);
  });
});
