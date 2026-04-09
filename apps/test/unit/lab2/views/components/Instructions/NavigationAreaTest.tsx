import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import lab, {setValidationState} from '@cdo/apps/lab2/lab2Redux';
import lab2Project, {
  setViewingAiTutorVersion,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import predictLevel, {
  setHasSubmittedResponse,
} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {LevelProperties} from '@cdo/apps/lab2/types';
import NavigationArea from '@cdo/apps/lab2/views/components/Instructions/NavigationArea';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

// Minimal prop shapes for mock child components.
interface ContinueButtonMockProps {
  children?: React.ReactNode;
  disabled?: boolean;
  tooltipMessage?: string;
  hideIfDisabled?: boolean;
}
interface SubmitButtonMockProps {
  enabled: boolean;
  tooltipMessage?: string;
}

// Mock child components, exposing props via data attributes so tests can
// inspect them without exercising child rendering logic.
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ContinueButton',
  () => ({
    __esModule: true,
    default: ({
      children,
      disabled,
      tooltipMessage,
    }: ContinueButtonMockProps) => (
      <button
        type="button"
        data-disabled={String(disabled)}
        data-tooltip={tooltipMessage}
      >
        {children}
      </button>
    ),
  })
);

jest.mock('@cdo/apps/lab2/views/components/Instructions/SubmitButton', () => ({
  __esModule: true,
  default: ({enabled, tooltipMessage}: SubmitButtonMockProps) => (
    <button
      type="button"
      data-enabled={String(enabled)}
      data-tooltip={tooltipMessage}
    >
      Submit
    </button>
  ),
}));

jest.mock('@cdo/apps/lab2/views/components/TextToSpeech', () => ({
  __esModule: true,
  default: () => <div>Text to speech</div>,
}));

jest.mock('@cdo/apps/templates/EnhancedSafeMarkdown', () => ({
  __esModule: true,
  default: ({markdown}: {markdown: string}) => <div>{markdown}</div>,
}));

// Mock progress selectors. Defaults: hasNextLevel=true (next level id=2,
// levelNumber=2), current levelNumber=1, no parent, lessonCount=1.
const mockGetNextLevel: jest.Mock = jest.fn(() => ({id: 2, levelNumber: 2}));
const mockGetCurrentLevel: jest.Mock = jest.fn(() => ({
  id: '1',
  levelNumber: 1,
  status: undefined,
}));
const mockGetParentLevel: jest.Mock = jest.fn(() => undefined);
const mockGetLessonCount: jest.Mock = jest.fn(() => 1);

jest.mock('@cdo/apps/code-studio/progressReduxSelectors', () => ({
  getNextLevel: (state: unknown) => mockGetNextLevel(state),
  getCurrentLevel: (state: unknown) => mockGetCurrentLevel(state),
  getParentLevel: (state: unknown) => mockGetParentLevel(state),
  getLessonCount: (state: unknown) => mockGetLessonCount(state),
}));

// Mock queryParams — no URL overrides in the default test environment.
const mockQueryParams: jest.Mock = jest.fn(() => null);
jest.mock('@cdo/apps/code-studio/utils', () => ({
  queryParams: (key: string) => mockQueryParams(key),
}));

function makeLevelProperties(
  overrides: Partial<LevelProperties> = {}
): LevelProperties {
  return {
    id: 1,
    name: 'test',
    appName: 'weblab2' as LevelProperties['appName'],
    ...overrides,
  } as LevelProperties;
}

describe('NavigationArea', () => {
  let store: Store;

  beforeEach(() => {
    stubRedux();
    registerReducers({lab, lab2Project, predictLevel});
    store = getStore();
    mockGetNextLevel.mockReturnValue({id: 2, levelNumber: 2});
    mockGetCurrentLevel.mockReturnValue({
      id: '1',
      levelNumber: 1,
      status: undefined,
    });
    mockGetParentLevel.mockReturnValue(undefined);
    mockGetLessonCount.mockReturnValue(1);
    mockQueryParams.mockReturnValue(null);
  });

  afterEach(() => {
    restoreRedux();
    jest.clearAllMocks();
  });

  function renderDefault(
    props: Partial<Parameters<typeof NavigationArea>[0]> = {}
  ) {
    const defaultProps = {
      levelProperties: makeLevelProperties(),
      isRunning: false,
      hasRun: false,
      hasEdited: false,
    };
    return render(
      <ThemeProvider>
        <Provider store={store}>
          <NavigationArea {...defaultProps} {...props} />
        </Provider>
      </ThemeProvider>
    );
  }

  describe('null rendering', () => {
    it('returns null when hideContinueIfDisabled=true, continue disabled, no feedback', () => {
      // requireRun=true and hasRun=false disables the continue button.
      renderDefault({requireRun: true, hideContinueIfDisabled: true});
      // NavigationArea returns null — no #instructions-feedback in the DOM.
      expect(document.getElementById('instructions-feedback')).toBeNull();
    });

    it('does not return null when hideContinueIfDisabled=true but feedback message exists', () => {
      store.dispatch(
        setValidationState({
          hasConditions: false,
          satisfied: false,
          message: 'Nice work!',
          index: 0,
        })
      );
      renderDefault({requireRun: true, hideContinueIfDisabled: true});
      expect(screen.getByText('Nice work!')).toBeInTheDocument();
    });
  });

  describe('button selection', () => {
    it('renders ContinueButton for non-submittable level', () => {
      renderDefault();
      expect(
        screen.getByRole('button', {name: 'Continue to Level 2'})
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Submit'})
      ).not.toBeInTheDocument();
    });

    it('renders SubmitButton when submittable=true', () => {
      renderDefault({
        levelProperties: makeLevelProperties({submittable: true}),
      });
      expect(screen.getByRole('button', {name: 'Submit'})).toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Continue to Level 2'})
      ).not.toBeInTheDocument();
    });
  });

  describe('ContinueButton disabled state', () => {
    function getContinueButton() {
      return screen.getByRole('button', {name: /.+/});
    }

    it('is enabled by default with no special conditions', () => {
      renderDefault();
      const btn = getContinueButton();
      expect(btn.dataset.disabled).toBe('false');
      expect(btn.dataset.tooltip).toBeUndefined();
    });

    it('is disabled with toContinueSubmitPrediction when isPredictLevel and predict not submitted', () => {
      renderDefault({
        levelProperties: makeLevelProperties({
          predictSettings: {isPredictLevel: true},
        }),
      });
      const btn = getContinueButton();
      expect(btn.dataset.disabled).toBe('true');
      expect(btn.dataset.tooltip).toBe('To continue, submit your prediction');
    });

    it('is enabled when isPredictLevel and predict is submitted', () => {
      store.dispatch(setHasSubmittedResponse(true));
      renderDefault({
        levelProperties: makeLevelProperties({
          predictSettings: {isPredictLevel: true},
        }),
      });
      expect(getContinueButton().dataset.disabled).toBe('false');
    });

    it('is disabled with toContinueValidate when hasConditions=true and not satisfied', () => {
      store.dispatch(
        setValidationState({
          hasConditions: true,
          satisfied: false,
          message: null,
          index: 0,
        })
      );
      renderDefault();
      const btn = getContinueButton();
      expect(btn.dataset.disabled).toBe('true');
      expect(btn.dataset.tooltip).toBe('To continue, validate your code');
    });

    it('is enabled when validation is satisfied', () => {
      store.dispatch(
        setValidationState({
          hasConditions: true,
          satisfied: true,
          message: null,
          index: 0,
        })
      );
      renderDefault();
      expect(getContinueButton().dataset.disabled).toBe('false');
    });

    it('is disabled with toContinueAiTutorVersion when viewingAiTutorVersion', () => {
      store.dispatch(setViewingAiTutorVersion(true));
      renderDefault();
      const btn = getContinueButton();
      expect(btn.dataset.disabled).toBe('true');
      expect(btn.dataset.tooltip).toBe(
        "To continue, accept or reject AI Tutor's version"
      );
    });

    it('is disabled with toContinueRun when requireRun=true and !hasRun', () => {
      renderDefault({requireRun: true, hasRun: false});
      const btn = getContinueButton();
      expect(btn.dataset.disabled).toBe('true');
      expect(btn.dataset.tooltip).toBe('To continue, run your code');
    });

    it('is enabled when requireRun=true and hasRun=true', () => {
      renderDefault({requireRun: true, hasRun: true});
      expect(getContinueButton().dataset.disabled).toBe('false');
    });

    it('is disabled with toContinueEdit when requireEditToContinue and !hasEdited', () => {
      renderDefault({
        levelProperties: makeLevelProperties({requireEditToContinue: true}),
        hasEdited: false,
      });
      const btn = getContinueButton();
      expect(btn.dataset.disabled).toBe('true');
      expect(btn.dataset.tooltip).toBe('To continue, edit your code');
    });

    it('is enabled when requireEditToContinue and hasEdited=true', () => {
      renderDefault({
        levelProperties: makeLevelProperties({requireEditToContinue: true}),
        hasEdited: true,
      });
      expect(getContinueButton().dataset.disabled).toBe('false');
    });
  });

  describe('SubmitButton enabled/disabled state', () => {
    function getSubmitButton() {
      return screen.getByRole('button', {name: 'Submit'});
    }

    const submittableProps = {
      levelProperties: makeLevelProperties({submittable: true}),
    };

    it('is disabled with toSubmitEditRun tooltip when !hasRun and !hasEdited', () => {
      renderDefault({...submittableProps, hasRun: false, hasEdited: false});
      const btn = getSubmitButton();
      expect(btn.dataset.enabled).toBe('false');
      expect(btn.dataset.tooltip).toBe('To submit, edit and run your code');
    });

    it('is disabled with toSubmitRun tooltip when hasEdited=true but !hasRun', () => {
      renderDefault({...submittableProps, hasRun: false, hasEdited: true});
      const btn = getSubmitButton();
      expect(btn.dataset.enabled).toBe('false');
      expect(btn.dataset.tooltip).toBe('To submit, run your code');
    });

    it('is disabled with toSubmitEdit tooltip when hasRun=true but !hasEdited', () => {
      renderDefault({...submittableProps, hasRun: true, hasEdited: false});
      const btn = getSubmitButton();
      expect(btn.dataset.enabled).toBe('false');
      expect(btn.dataset.tooltip).toBe('To submit, edit your code');
    });

    it('is enabled with no tooltip when hasRun=true and hasEdited=true', () => {
      renderDefault({...submittableProps, hasRun: true, hasEdited: true});
      const btn = getSubmitButton();
      expect(btn.dataset.enabled).toBe('true');
      expect(btn.dataset.tooltip).toBeUndefined();
    });

    it('is enabled when disableEditRunForSubmission=true regardless of hasRun/hasEdited', () => {
      renderDefault({
        levelProperties: makeLevelProperties({
          submittable: true,
          disableEditRunForSubmission: true,
        }),
        hasRun: false,
        hasEdited: false,
      });
      const btn = getSubmitButton();
      expect(btn.dataset.enabled).toBe('true');
      expect(btn.dataset.tooltip).toBeUndefined();
    });

    it('is disabled with toSubmitValidate when hasConditions=true and not satisfied', () => {
      store.dispatch(
        setValidationState({
          hasConditions: true,
          satisfied: false,
          message: null,
          index: 0,
        })
      );
      renderDefault({...submittableProps, hasRun: true, hasEdited: true});
      const btn = getSubmitButton();
      expect(btn.dataset.enabled).toBe('false');
      expect(btn.dataset.tooltip).toBe(
        'To submit, your code must meet all goals'
      );
    });

    it('is enabled when the level has already been submitted', () => {
      mockGetCurrentLevel.mockReturnValue({
        id: '1',
        levelNumber: 1,
        status: LevelStatus.submitted,
      });
      renderDefault({...submittableProps, hasRun: false, hasEdited: false});
      expect(getSubmitButton().dataset.enabled).toBe('true');
    });
  });

  describe('feedback message', () => {
    it('renders feedback message when validationMessage is set', () => {
      store.dispatch(
        setValidationState({
          hasConditions: false,
          satisfied: false,
          message: 'Excellent!',
          index: 0,
        })
      );
      renderDefault();
      expect(screen.getByText('Excellent!')).toBeInTheDocument();
    });

    it('does not render feedback when no validationMessage', () => {
      renderDefault();
      expect(
        document.getElementById('instructions-feedback-message')!.children
      ).toHaveLength(1);
    });

    it('focuses feedback div when validationMessage is set and not running', () => {
      store.dispatch(
        setValidationState({
          hasConditions: false,
          satisfied: false,
          message: 'Well done!',
          index: 0,
        })
      );
      renderDefault({isRunning: false});
      const focusTarget = screen
        .getByText('Well done!')
        .closest('[tabindex="-1"]');
      expect(document.activeElement).toBe(focusTarget);
    });

    it('does not focus feedback div when isRunning=true', () => {
      store.dispatch(
        setValidationState({
          hasConditions: false,
          satisfied: false,
          message: 'Well done!',
          index: 0,
        })
      );
      renderDefault({isRunning: true});
      const focusTarget = screen
        .getByText('Well done!')
        .closest('[tabindex="-1"]');
      expect(document.activeElement).not.toBe(focusTarget);
    });
  });

  describe('TTS', () => {
    beforeEach(() => {
      store.dispatch(
        setValidationState({
          hasConditions: false,
          satisfied: false,
          message: 'Great!',
          index: 0,
        })
      );
    });

    it('shows TTS when offerBrowserTts=true, feedback present, hideContinueIfDisabled=false', () => {
      renderDefault({
        levelProperties: makeLevelProperties({offerBrowserTts: true}),
        hideContinueIfDisabled: false,
      });
      expect(screen.getByText('Text to speech')).toBeInTheDocument();
    });

    it('does not show TTS when hideContinueIfDisabled=true', () => {
      renderDefault({
        levelProperties: makeLevelProperties({offerBrowserTts: true}),
        hideContinueIfDisabled: true,
      });
      expect(screen.queryByText('Text to speech')).not.toBeInTheDocument();
    });

    it('does not show TTS when no feedback message', () => {
      store.dispatch(
        setValidationState({
          hasConditions: false,
          satisfied: false,
          message: null,
          index: 0,
        })
      );
      renderDefault({
        levelProperties: makeLevelProperties({offerBrowserTts: true}),
      });
      expect(screen.queryByText('Text to speech')).not.toBeInTheDocument();
    });

    it('does not show TTS when offerBrowserTts=false', () => {
      renderDefault({
        levelProperties: makeLevelProperties({offerBrowserTts: false}),
      });
      expect(screen.queryByText('Text to speech')).not.toBeInTheDocument();
    });
  });

  describe('button text', () => {
    it('renders "Continue to Level 2" when next level has a different number', () => {
      // Default mock: current levelNumber=1, next levelNumber=2.
      renderDefault();
      expect(
        screen.getByRole('button', {name: 'Continue to Level 2'})
      ).toBeInTheDocument();
    });

    it('renders "Continue" when next level has the same number (sublevel to parent)', () => {
      mockGetCurrentLevel.mockReturnValue({
        id: '1',
        levelNumber: 2,
        status: undefined,
      });
      mockGetNextLevel.mockReturnValue({id: 2, levelNumber: 2});
      renderDefault();
      expect(
        screen.getByRole('button', {name: 'Continue'})
      ).toBeInTheDocument();
    });

    it('renders "Continue" when textVariant="simple" and there is a next level', () => {
      renderDefault({textVariant: 'simple'});
      expect(
        screen.getByRole('button', {name: 'Continue'})
      ).toBeInTheDocument();
    });

    it('uses parent level number when getParentLevel returns a level', () => {
      mockGetParentLevel.mockReturnValue({levelNumber: 3});
      mockGetNextLevel.mockReturnValue({id: 2, levelNumber: 5});
      renderDefault();
      // parent levelNumber=3, next levelNumber=5: different → 'Continue to Level 5'
      expect(
        screen.getByRole('button', {name: 'Continue to Level 5'})
      ).toBeInTheDocument();
    });
  });
});
