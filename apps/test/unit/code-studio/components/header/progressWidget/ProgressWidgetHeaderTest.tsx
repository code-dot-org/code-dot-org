import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import ProgressWidgetHeader from '@cdo/apps/code-studio/components/header/progressWidget/ProgressWidgetHeader';
import {HeaderNavigation} from '@cdo/apps/code-studio/headerRedux';
import {requestHeaderContinue} from '@cdo/apps/lab2/progress/headerNavigation';
import {LevelKind, LevelStatus} from '@cdo/generated-scripts/sharedConstants';
import commonI18n from '@cdo/locale';

const mockLevels = [
  {id: '1', levelNumber: 1, status: LevelStatus.perfect, url: '/l/1'},
  {
    id: '2',
    levelNumber: 2,
    status: LevelStatus.passed,
    isConceptLevel: true,
    url: '/l/2',
  },
  {
    id: '3',
    levelNumber: 3,
    status: LevelStatus.attempted,
    isCurrentLevel: true,
  },
  {
    id: '4',
    levelNumber: 4,
    status: LevelStatus.perfect,
    teacherFeedbackReviewState: 'keepWorking',
    kind: LevelKind.assessment,
    url: '/l/4',
  },
  {id: '5', levelNumber: 5, isLocked: true, url: '/l/5'},
  {id: '6', levelNumber: 6, bonus: true, url: '/l/6'},
];

jest.mock('@cdo/apps/code-studio/progressReduxSelectors', () => ({
  getCurrentLevels: () => mockLevels,
  getCurrentLevel: () => mockLevels[2],
  lessonExtrasUrl: () => '/extras',
}));
jest.mock('@cdo/apps/code-studio/browserNavigation', () => ({
  canChangeLevelInPage: () => false,
}));
jest.mock('@cdo/apps/lab2/progress/headerNavigation', () => ({
  requestHeaderContinue: jest.fn(),
}));
// Connected to stores of its own.
jest.mock('@cdo/apps/code-studio/components/header/ProjectInfo', () => ({
  __esModule: true,
  default: () => null,
}));

function renderHeader({
  headerNavigation,
  showProjectUpdatedAt = false,
}: {
  headerNavigation?: HeaderNavigation;
  showProjectUpdatedAt?: boolean;
} = {}) {
  const store = createStore(() => ({
    isRtl: false,
    progress: {currentLevelId: '3', currentLessonId: 1, isLessonExtras: false},
    header: {headerNavigation},
    project: {
      showProjectUpdatedAt,
      projectUpdatedStatus: 'saved',
      projectUpdatedAt: new Date().toISOString(),
    },
  }));
  return render(
    <Provider store={store}>
      <ProgressWidgetHeader
        scriptData={{name: 'unit'}}
        lessonName="Lesson 2: Sequencing"
      />
    </Provider>
  );
}

const label = (levelNumber: number, status: string) =>
  commonI18n.progressWidgetLevel({levelNumber, status});

describe('ProgressWidgetHeader', () => {
  it('names each bubble by its number and status', () => {
    renderHeader();
    expect(
      screen.getByRole('link', {
        name: label(1, commonI18n.progressWidgetStatusCompleted()),
      })
    ).toHaveAttribute('href', '/l/1');
    expect(
      screen.getByLabelText(label(2, commonI18n.progressWidgetStatusPassed()))
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        label(4, commonI18n.progressWidgetStatusKeepWorking())
      )
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(label(5, commonI18n.progressWidgetStatusLocked()))
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('marks the current level and does not link to it', () => {
    renderHeader();
    const current = screen.getByLabelText(
      label(3, commonI18n.progressWidgetStatusInProgress())
    );
    expect(current).toHaveAttribute('aria-current', 'step');
    expect(current.tagName).not.toBe('A');
  });

  it('leaves bonus levels to the lesson extras bubble', () => {
    renderHeader();
    expect(screen.queryByText(/Level 6/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: commonI18n.stageExtras()})
    ).toHaveAttribute('href', '/extras');
  });

  it('draws no Continue until the lab publishes one', () => {
    renderHeader();
    expect(
      screen.queryByRole('button', {name: commonI18n.continue()})
    ).not.toBeInTheDocument();
  });

  it("asks the lab to continue from the lab's published button", () => {
    renderHeader({headerNavigation: {label: 'Continue', enabled: true}});
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    expect(requestHeaderContinue).toHaveBeenCalledTimes(1);
  });

  it('disables Continue when the lab does', () => {
    renderHeader({headerNavigation: {label: 'Continue', enabled: false}});
    expect(screen.getByRole('button', {name: 'Continue'})).toBeDisabled();
  });

  it('shows the save status only for project levels', () => {
    const {unmount} = renderHeader();
    expect(screen.queryByRole('img', {name: /Saved/})).not.toBeInTheDocument();
    unmount();
    renderHeader({showProjectUpdatedAt: true});
    expect(screen.getByRole('img', {name: /Saved/})).toBeInTheDocument();
  });

  it('starts with the lesson menu closed', () => {
    renderHeader();
    const button = screen.getByRole('button', {name: 'Lesson 2: Sequencing'});
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
