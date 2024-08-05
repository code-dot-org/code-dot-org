import ReactDOM from 'react-dom/client';

import initPage from '@cdo/apps/sites/studio/pages/scripts/edit';

import {allowConsoleWarnings} from '../../../../util/throwOnConsole';

describe('the level builder page init script', () => {
  // Warnings allowed due to usage of deprecated componentWillReceiveProps
  // lifecycle method.
  allowConsoleWarnings();

  let container;
  beforeEach(() => {
    jest.spyOn(ReactDOM, 'createRoot').mockClear();
    container = document.createElement('div');
    document.body.appendChild(container);
    container.className = 'edit_container';
    initPage({
      script: {
        name: 'Test script',
        lessons: [],
        is_migrated: false,
        scriptPath: '/s/test-script',
        coursePublishedState: 'beta',
        instructionType: 'teacher_led',
        instructorAudience: 'teacher',
        participantAudience: 'student',
      },
      i18n: {
        description:
          '# TEACHER Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
        studentDescription:
          '# STUDENT Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
      },
      locales: [
        ['English', 'en-US'],
        ['French', 'fr-FR'],
      ],
      script_families: ['coursea', 'csd1'],
      version_year_options: ['2017', '2018'],
    });
  });

  afterEach(() => {
    ReactDOM.createRoot.mockRestore();
  });

  it('renders to a div with the edit_container class', () => {
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(container);
  });
});
