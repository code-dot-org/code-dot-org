import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {
  AI_COUNTRY_AVAILABILITY_SUPPORT_LINK,
  AI_SETTINGS_SUPPORT_LINK,
  usOnlyModelsEssentialMessage,
} from '@cdo/apps/aichat/constants';
import RequiresAiChatToolsAlert from '@cdo/apps/aiComponentLibrary/aiChatToolsDependencyAlerts/RequiresAiChatToolsAlert';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import teacherSections, {
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {serverSectionFromSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';

// The component is only rendered where AI chat tools are essential, so every
// section here is assigned such a course.
const SECTION_DEFAULTS = {
  id: 1,
  name: 'Period 1',
  hidden: false,
  courseVersionName: 'csa-2022',
  unitName: 'csa1-2022',
  unitPosition: 1,
  participantType: 'student',
  assigned_ai_chat_tools_dependency: 'essential',
  ai_chat_access_level: 'enabled',
};

const INFO_TEXT = 'This course requires the use of AI chat tools to complete.';

const renderWithSection = (section = {}, props = {}) => {
  const {subject = 'course', ...alertProps} = props;
  const store = getStore();
  store.dispatch(
    setSections([serverSectionFromSection({...SECTION_DEFAULTS, ...section})])
  );
  store.dispatch(selectSection(SECTION_DEFAULTS.id));
  render(
    <Provider store={store}>
      <RequiresAiChatToolsAlert subject={subject} {...alertProps} />
    </Provider>
  );
};

describe('RequiresAiChatToolsAlert', () => {
  // The store is a singleton, so each test needs a fresh one: a section left
  // selected by an earlier test would answer for the one under test.
  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections});
  });

  afterEach(() => {
    restoreRedux();
  });

  it('shows only the informational alert when AI chat tools are reachable', () => {
    renderWithSection();

    screen.getByText(INFO_TEXT);
    expect(
      screen.queryByText(usOnlyModelsEssentialMessage('course'))
    ).toBeNull();
    expect(
      screen.queryByRole('button', {name: 'Review AI Settings'})
    ).toBeNull();
  });

  it('names the course when the course page reports blocked models', () => {
    renderWithSection({}, {requiresInaccessibleAiModels: true});

    screen.getByText(usOnlyModelsEssentialMessage('course'));
    expect(screen.queryByText(usOnlyModelsEssentialMessage('unit'))).toBeNull();
  });

  it('names the unit when the unit page reports blocked models', () => {
    renderWithSection(
      {},
      {subject: 'unit', requiresInaccessibleAiModels: true}
    );

    screen.getByText(usOnlyModelsEssentialMessage('unit'));
    expect(
      screen.queryByText(usOnlyModelsEssentialMessage('course'))
    ).toBeNull();
  });

  // The caller answers for its own subject -- the course overview for the
  // course, the unit overview for the unit on screen -- so an unset prop means
  // "nothing blocked here", never "go ask the section".
  it('stays quiet when the caller reports nothing blocked', () => {
    renderWithSection({}, {requiresInaccessibleAiModels: false});

    expect(
      screen.queryByText(usOnlyModelsEssentialMessage('course'))
    ).toBeNull();
  });

  it('warns when AI chat tools are switched off for the section', () => {
    renderWithSection({ai_chat_access_level: 'disabled'});

    screen.getByRole('button', {name: 'Review AI Settings'});
    expect(screen.queryByText(INFO_TEXT)).toBeNull();
  });

  // The two problems are independent: fixing the access level would not make
  // the blocked models reachable, so neither warning hides the other.
  it('warns about both when models are unreachable and tools are switched off', () => {
    renderWithSection(
      {ai_chat_access_level: 'disabled'},
      {requiresInaccessibleAiModels: true}
    );

    screen.getByText(usOnlyModelsEssentialMessage('course'));
    screen.getByRole('button', {name: 'Review AI Settings'});
  });

  // Each banner sends the teacher somewhere it can actually help: blocked
  // models to the country availability article, a disabled access level to the
  // AI settings article.
  it('links each warning to the article that explains it', () => {
    renderWithSection(
      {ai_chat_access_level: 'disabled'},
      {requiresInaccessibleAiModels: true}
    );

    const hrefOf = text =>
      screen
        .getByText(text)
        .closest('div')
        ?.querySelector('a')
        ?.getAttribute('href');

    expect(hrefOf(usOnlyModelsEssentialMessage('course'))).toBe(
      AI_COUNTRY_AVAILABILITY_SUPPORT_LINK
    );
    expect(
      hrefOf(/AI tools are\s+currently disabled in this class section/)
    ).toBe(AI_SETTINGS_SUPPORT_LINK);
  });

  it('warns about nothing when no section is selected', () => {
    render(
      <Provider store={getStore()}>
        <RequiresAiChatToolsAlert subject="course" />
      </Provider>
    );

    expect(
      screen.queryByText(usOnlyModelsEssentialMessage('course'))
    ).toBeNull();
  });
});
