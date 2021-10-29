import sinon from 'sinon';
import ReactDOM from 'react-dom';
import {expect} from '../../../../util/reconfiguredChai';
import initPage from '@cdo/apps/sites/studio/pages/scripts/edit';
import {allowConsoleWarnings} from '../../../../util/throwOnConsole';

describe('the level builder page init script', () => {
  // Warnings allowed due to usage of deprecated componentWillReceiveProps
  // lifecycle method.
  allowConsoleWarnings();

  let container;
  beforeEach(() => {
    sinon.spy(ReactDOM, 'render');
    container = document.createElement('div');
    document.body.appendChild(container);
    container.className = 'edit_container';
    initPage({
      script: {
        name: 'Test script',
        lessons: [],
        is_migrated: false,
        scriptPath: '/s/test-script',
        publishedState: 'beta',
        instructionType: 'teacher_led',
        instructorAudience: 'teacher',
        participantAudience: 'student'
      },
      i18n: {
        lessonDescriptions: [],
        description:
          '# TEACHER Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
        studentDescription:
          '# STUDENT Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
      },
      locales: [['English', 'en-US'], ['French', 'fr-FR']],
      script_families: ['coursea', 'csd1'],
      version_year_options: ['2017', '2018']
    });
  });

  afterEach(() => {
    ReactDOM.render.restore();
  });

  it('renders to a div with the edit_container class', () => {
    expect(ReactDOM.render.calledWith(sinon.match.object, container)).to.be
      .true;
  });
});
