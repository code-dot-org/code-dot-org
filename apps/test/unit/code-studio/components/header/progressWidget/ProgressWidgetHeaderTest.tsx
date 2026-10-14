import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {AnyAction, createStore} from 'redux';

import ProgressWidgetHeader from '@cdo/apps/code-studio/components/header/progressWidget/ProgressWidgetHeader';
import {HeaderNavigation} from '@cdo/apps/code-studio/headerRedux';
import {requestHeaderContinue} from '@cdo/apps/lab2/progress/headerNavigation';
import {LevelKind, LevelStatus} from '@cdo/generated-scripts/sharedConstants';

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
  {id: '7', levelNumber: 7, status: LevelStatus.review_rejected, url: '/l/7'},
  {id: '8', levelNumber: 8, status: LevelStatus.submitted, url: '/l/8'},
];

const mockCanChangeLevelInPage = jest.fn(() => false);

jest.mock('@cdo/apps/code-studio/progressReduxSelectors', () => ({
  getCurrentLevels: () => mockLevels,
  lessonExtrasUrl: () => '/extras',
}));
jest.mock('@cdo/apps/code-studio/browserNavigation', () => ({
  canChangeLevelInPage: () => mockCanChangeLevelInPage(),
}));
jest.mock('@cdo/apps/code-studio/progressRedux', () => ({
  navigateToLevelId: (id: string) => ({type: 'test/navigate', id}),
}));
jest.mock('@cdo/apps/lab2/progress/headerNavigation', () => ({
  requestHeaderContinue: jest.fn(),
}));
// Connected to stores of their own.
jest.mock('@cdo/apps/code-studio/components/header/ProjectInfo', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@cdo/apps/code-studio/components/header/HeaderPopup', () => ({
  HeaderPopupPanel: require('react').forwardRef(
    ({windowHeight}: {windowHeight: number}, ref: React.Ref<HTMLDivElement>) =>
      require('react').createElement(
        'div',
        {ref, 'data-window-height': windowHeight},
        'lesson menu'
      )
  ),
}));

interface ProjectProps {
  showProjectUpdatedAt?: boolean;
  projectUpdatedStatus?: string;
  projectUpdatedAt?: string;
}

function renderHeader({
  headerNavigation,
  project = {},
}: {
  headerNavigation?: HeaderNavigation;
  project?: ProjectProps;
} = {}) {
  const dispatched: AnyAction[] = [];
  const initialState = {
    isRtl: false,
    progress: {currentLevelId: '3', currentLessonId: 1, isLessonExtras: false},
    header: {headerNavigation},
    project: {showProjectUpdatedAt: false, ...project},
  };
  const store = createStore(
    (state: typeof initialState = initialState, action: AnyAction) => {
      dispatched.push(action);
      return action.type === 'test/setLevel'
        ? {...state, progress: {...state.progress, currentLevelId: action.id}}
        : state;
    }
  );
  const onLessonMenuOpen = jest.fn();
  const result = render(
    <Provider store={store}>
      <ProgressWidgetHeader
        scriptData={{name: 'unit'}}
        lessonName="Lesson 2: Sequencing"
        onLessonMenuOpen={onLessonMenuOpen}
      />
    </Provider>
  );
  return {...result, store, dispatched, onLessonMenuOpen};
}

const lessonButton = () =>
  screen.getByRole('button', {name: 'Lesson 2: Sequencing'});

describe('ProgressWidgetHeader', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockCanChangeLevelInPage.mockReturnValue(false);
  });

  it('names each bubble by number, assessment and status', () => {
    renderHeader();
    expect(
      screen.getByRole('link', {name: 'Level 1, completed'})
    ).toHaveAttribute('href', '/l/1');
    expect(screen.getByLabelText('Level 2, passed')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Level 4, assessment, keep working')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Level 5, locked')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByLabelText('Level 7, rejected')).toBeInTheDocument();
    expect(screen.getByLabelText('Level 8, completed')).toBeInTheDocument();
  });

  it('marks the current level and does not link to it', () => {
    renderHeader();
    const current = screen.getByLabelText('Level 3, in progress');
    expect(current).toHaveAttribute('aria-current', 'step');
    expect(current.tagName).not.toBe('A');
  });

  it('leaves bonus levels to the lesson extras flag, keeping the query', () => {
    window.history.pushState({}, '', '/l/3?section_id=5&id=9');
    renderHeader();
    expect(screen.queryByLabelText(/Level 6/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Lesson Extras'})).toHaveAttribute(
      'href',
      '/extras?section_id=5'
    );
    window.history.pushState({}, '', '/');
  });

  it('navigates in page, but lets modified clicks open a new tab', () => {
    mockCanChangeLevelInPage.mockReturnValue(true);
    const {dispatched} = renderHeader();
    const bubble = screen.getByRole('link', {name: 'Level 1, completed'});

    fireEvent.click(bubble, {metaKey: true});
    expect(dispatched).not.toContainEqual({type: 'test/navigate', id: '1'});

    fireEvent.click(bubble);
    expect(dispatched).toContainEqual({type: 'test/navigate', id: '1'});
  });

  describe('Continue', () => {
    it('draws nothing until the lab publishes', () => {
      renderHeader();
      expect(document.getElementById('instructions-continue-button')).toBe(
        null
      );
    });

    it("asks the lab to continue from the lab's published button", () => {
      renderHeader({headerNavigation: {label: 'Continue', enabled: true}});
      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      expect(requestHeaderContinue).toHaveBeenCalledTimes(1);
    });

    it('offers its tooltip to the keyboard only while disabled', () => {
      const tooltip = 'To continue, run your code';
      const {unmount} = renderHeader({
        headerNavigation: {label: 'Continue', enabled: true, tooltip},
      });
      expect(document.querySelector('div[tabindex="0"]')).toBe(null);
      unmount();

      renderHeader({
        headerNavigation: {label: 'Continue', enabled: false, tooltip},
      });
      expect(screen.getByRole('button', {name: 'Continue'})).toBeDisabled();
      expect(document.querySelector('div[tabindex="0"]')).not.toBe(null);
    });
  });

  describe('save status', () => {
    const saveIcon = () => screen.queryByRole('img', {name: /Sav|offline/});

    it('shows nothing on levels with no project', () => {
      renderHeader();
      expect(saveIcon()).toBe(null);
    });

    it.each([
      [{projectUpdatedStatus: 'saving'}, 'Saving...'],
      [{projectUpdatedStatus: 'error'}, 'Not saved'],
      [{projectUpdatedStatus: 'saved'}, 'Saved'],
    ])('names the icon for %o', (project, name) => {
      renderHeader({project: {showProjectUpdatedAt: true, ...project}});
      expect(screen.getByRole('img', {name})).toBeInTheDocument();
    });

    it('says how long ago the project was saved', () => {
      renderHeader({
        project: {
          showProjectUpdatedAt: true,
          projectUpdatedStatus: 'saved',
          projectUpdatedAt: new Date().toISOString(),
        },
      });
      expect(
        screen.getByRole('img', {name: /^Saved a few seconds ago$/})
      ).toBeInTheDocument();
    });

    it('says when the student is offline', () => {
      jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
      renderHeader({project: {showProjectUpdatedAt: true}});
      expect(
        screen.getByRole('img', {name: "You're offline"})
      ).toBeInTheDocument();
      jest.restoreAllMocks();
    });
  });

  describe('lesson menu', () => {
    it('loads progress and opens from the lesson button', () => {
      const {onLessonMenuOpen} = renderHeader();
      expect(lessonButton()).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(lessonButton());

      expect(onLessonMenuOpen).toHaveBeenCalledTimes(1);
      expect(lessonButton()).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('lesson menu')).toBeInTheDocument();
    });

    it('stays open for clicks inside it and closes for clicks elsewhere', () => {
      renderHeader();
      fireEvent.click(lessonButton());

      fireEvent.click(screen.getByText('lesson menu'));
      expect(screen.getByText('lesson menu')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Level 3, in progress'));
      expect(screen.queryByText('lesson menu')).toBe(null);
    });

    it('closes on Escape and returns focus to the lesson button', () => {
      renderHeader();
      fireEvent.click(lessonButton());

      fireEvent.keyDown(document, {key: 'Escape'});

      expect(screen.queryByText('lesson menu')).toBe(null);
      expect(lessonButton()).toHaveFocus();
    });

    it('follows the window height while open', () => {
      renderHeader();
      fireEvent.click(lessonButton());

      Object.defineProperty(document.documentElement, 'clientHeight', {
        configurable: true,
        value: 480,
      });
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(screen.getByText('lesson menu')).toHaveAttribute(
        'data-window-height',
        '480'
      );
    });

    it('closes when the level changes in page', () => {
      const {store} = renderHeader();
      fireEvent.click(lessonButton());

      act(() => {
        store.dispatch({type: 'test/setLevel', id: '1'});
      });

      expect(screen.queryByText('lesson menu')).toBe(null);
    });
  });

  it('marks the document as carrying the header', () => {
    delete document.documentElement.dataset.headerPresent;
    renderHeader();
    expect(document.documentElement.dataset.headerPresent).toBe('true');
  });
});
