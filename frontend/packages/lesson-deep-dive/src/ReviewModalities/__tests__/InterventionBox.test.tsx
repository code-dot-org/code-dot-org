import {fireEvent, render, screen} from '@testing-library/react';
import {vi} from 'vitest';

import {EVENTS} from '../../analyticsEvents';
import InterventionBox from '../InterventionBox';

// The modality content components pull in heavy dependencies (audio, video,
// chat) that are irrelevant to the navigation behavior under test, so
// each is replaced with a lightweight marker whose text we can assert on.
vi.mock('../Chat', () => ({default: () => <div>chat content</div>}));
vi.mock('../../ChallengeActivities/Challenges', () => ({
  default: ({
    onReviewInstead,
    onModalityChange,
    onChallengeStarted,
  }: {
    onReviewInstead: () => void;
    onModalityChange: (modality: 'video' | 'whiteboard') => void;
    onChallengeStarted: (challenge: {id: number}, type: string) => void;
  }) => (
    <div>
      challenge content
      <button type="button" onClick={onReviewInstead}>
        review instead
      </button>
      <button type="button" onClick={() => onModalityChange('whiteboard')}>
        pick whiteboard
      </button>
      <button
        type="button"
        onClick={() => onChallengeStarted({id: 5}, 'whiteboard')}
      >
        start challenge
      </button>
    </div>
  ),
}));
vi.mock('../PodcastsBox', () => ({default: () => <div>podcasts content</div>}));
vi.mock('../VideosBox', () => ({default: () => <div>videos content</div>}));
vi.mock('../VocabularyFlashcards', () => ({
  default: () => <div>flashcards content</div>,
}));

const Empty = () => null;

const sendEvent = vi.fn();

const LESSON_ID = 42;
const LESSON_NAME = 'Variables';

interface RenderOpts {
  focusTopic?: string;
  challengeEnabled?: boolean;
  onModalitySelected?: (modality: string) => void;
  onDone?: () => void;
}

function renderInterventionBox({
  focusTopic,
  challengeEnabled = true,
  onModalitySelected,
  onDone,
}: RenderOpts = {}) {
  render(
    <InterventionBox
      lessonId={LESSON_ID}
      lessonName={LESSON_NAME}
      lessonSummary=""
      vocabulary={[]}
      assessmentAnalysis={[]}
      objectives={[]}
      jsonVideos={[]}
      reflectionData={null}
      focusTopic={focusTopic}
      challengeEnabled={challengeEnabled}
      VideoPlayer={Empty}
      TutorChat={Empty}
      sendEvent={sendEvent}
      onModalitySelected={onModalitySelected}
      onDone={onDone}
    />,
  );
}

describe('InterventionBox', () => {
  beforeEach(() => {
    sendEvent.mockReset();
  });

  it('Does not list the Challenge option when challenges are disabled', () => {
    renderInterventionBox({challengeEnabled: false});
    expect(
      screen.queryByRole('button', {name: /I want a challenge instead/i}),
    ).not.toBeInTheDocument();
  });

  it('lists the Challenge option in the practice menu', () => {
    renderInterventionBox();
    expect(
      screen.getByRole('button', {name: /I want a challenge instead/i}),
    ).toBeInTheDocument();
  });

  it('renders Challenges and reports the click when the Challenge link is clicked', () => {
    const onModalitySelected = vi.fn();
    renderInterventionBox({onModalitySelected});

    fireEvent.click(
      screen.getByRole('button', {name: /I want a challenge instead/i}),
    );

    expect(screen.getByText('challenge content')).toBeInTheDocument();
    expect(onModalitySelected).toHaveBeenCalledWith('challenge');
  });

  it('shows personalised subtext when focusTopic is provided', () => {
    renderInterventionBox({focusTopic: 'variables and scope'});
    // The <p> wraps all three inline nodes; its combined text content covers
    // both the prefix and the suffix.
    const subtext = screen.getByText(/Based on your reflection/i);
    expect(subtext).toHaveTextContent(
      'Based on your reflection, we\'ll start with "variables and scope". You can work any way you like from here.',
    );
    // The topic itself is wrapped in <strong>.
    expect(screen.getByText('variables and scope').tagName.toLowerCase()).toBe(
      'strong',
    );
  });

  it('strips a trailing period from focusTopic in the subtext', () => {
    renderInterventionBox({focusTopic: 'loops.'});
    // The <strong> element must not carry the trailing period.
    expect(screen.getByText('loops').tagName.toLowerCase()).toBe('strong');
  });

  it('shows fallback subtext when focusTopic is not provided', () => {
    renderInterventionBox();
    expect(
      screen.getByText('You can work any way you like from here.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Based on your reflection/),
    ).not.toBeInTheDocument();
  });

  describe('initialSelection prop', () => {
    it('shows the choice grid when initialSelection is omitted', () => {
      renderInterventionBox();
      expect(screen.getByText("Let's get to work")).toBeInTheDocument();
      expect(screen.queryByText('challenge content')).not.toBeInTheDocument();
    });

    it('opens directly to challenge content when initialSelection is "challenge"', () => {
      render(
        <InterventionBox
          lessonId={LESSON_ID}
          lessonName={LESSON_NAME}
          lessonSummary=""
          vocabulary={[]}
          assessmentAnalysis={[]}
          objectives={[]}
          jsonVideos={[]}
          reflectionData={null}
          initialSelection="challenge"
          challengeEnabled
          VideoPlayer={Empty}
          TutorChat={Empty}
          sendEvent={sendEvent}
        />,
      );
      expect(screen.getByText('challenge content')).toBeInTheDocument();
      expect(screen.queryByText("Let's get to work")).not.toBeInTheDocument();
    });
  });

  describe('nav bar', () => {
    it('is absent on the initial choice grid', () => {
      renderInterventionBox();
      expect(
        screen.queryByRole('navigation', {name: 'Modality navigation'}),
      ).not.toBeInTheDocument();
    });

    it('does not appear when the challenge modality is selected', () => {
      renderInterventionBox();
      fireEvent.click(
        screen.getByRole('button', {name: /I want a challenge instead/i}),
      );
      expect(
        screen.queryByRole('navigation', {name: 'Modality navigation'}),
      ).not.toBeInTheDocument();
    });

    it.each([
      ['Watch a video', 'videos content'],
      ['Listen to a podcast', 'podcasts content'],
      ['Practice with flashcards', 'flashcards content'],
      ['Chat with Tutor', 'chat content'],
    ])('appears after selecting "%s"', (cardLabel, contentMarker) => {
      renderInterventionBox();
      fireEvent.click(screen.getByRole('button', {name: cardLabel}));
      expect(screen.getByText(contentMarker)).toBeInTheDocument();
      expect(
        screen.getByRole('navigation', {name: 'Modality navigation'}),
      ).toBeInTheDocument();
    });

    it('Home button returns to the choice grid and hides the nav bar', () => {
      renderInterventionBox();
      fireEvent.click(screen.getByRole('button', {name: /Watch a video/i}));
      expect(
        screen.getByRole('navigation', {name: 'Modality navigation'}),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', {name: /Home/i}));

      expect(
        screen.queryByRole('navigation', {name: 'Modality navigation'}),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Let's get to work")).toBeInTheDocument();
    });

    it('clicking a modality tab in the nav bar switches the content', () => {
      renderInterventionBox();
      fireEvent.click(screen.getByRole('button', {name: /Watch a video/i}));
      expect(screen.getByText('videos content')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', {name: /^Chat$/i}));
      expect(screen.getByText('chat content')).toBeInTheDocument();
      expect(screen.queryByText('videos content')).not.toBeInTheDocument();
    });

    it('marks the active modality tab with aria-current', () => {
      renderInterventionBox();
      fireEvent.click(
        screen.getByRole('button', {name: /Listen to a podcast/i}),
      );

      expect(screen.getByRole('button', {name: /^Podcast$/i})).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(
        screen.getByRole('button', {name: /^Video$/i}),
      ).not.toHaveAttribute('aria-current');
    });

    it('Done button calls onDone when clicked', () => {
      const onDone = vi.fn();
      renderInterventionBox({onDone});
      fireEvent.click(screen.getByRole('button', {name: /Watch a video/i}));

      fireEvent.click(screen.getByRole('button', {name: /Done/i}));

      expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('Done button is absent when onDone is not provided', () => {
      renderInterventionBox();
      fireEvent.click(screen.getByRole('button', {name: /Watch a video/i}));
      expect(
        screen.queryByRole('button', {name: /Done/i}),
      ).not.toBeInTheDocument();
    });
  });

  describe('Tutor+ analytics', () => {
    it('reports a modality picked from the grid with source "picker"', () => {
      renderInterventionBox();
      fireEvent.click(screen.getByRole('button', {name: /Watch a video/i}));

      expect(sendEvent).toHaveBeenCalledWith(
        EVENTS.TUTOR_PLUS_PRACTICE_MODALITY_SELECTED,
        {lesson_id: LESSON_ID, modality: 'videos', source: 'picker'},
      );
    });

    it('reports a modality picked from the nav bar with source "tab_switch"', () => {
      renderInterventionBox();
      fireEvent.click(screen.getByRole('button', {name: /Watch a video/i}));
      fireEvent.click(screen.getByRole('button', {name: /^Chat$/i}));

      expect(sendEvent).toHaveBeenCalledWith(
        EVENTS.TUTOR_PLUS_PRACTICE_MODALITY_SELECTED,
        {lesson_id: LESSON_ID, modality: 'chat', source: 'tab_switch'},
      );
    });

    it('reports switching to a challenge as a next step, not a modality', () => {
      renderInterventionBox();
      fireEvent.click(
        screen.getByRole('button', {name: /I want a challenge instead/i}),
      );

      expect(sendEvent).toHaveBeenCalledWith(
        EVENTS.TUTOR_PLUS_NEXT_STEP_CHOSEN,
        {lesson_id: LESSON_ID, choice: 'challenge', source: 'practice_screen'},
      );
      expect(sendEvent).not.toHaveBeenCalledWith(
        EVENTS.TUTOR_PLUS_PRACTICE_MODALITY_SELECTED,
        expect.anything(),
      );
    });

    it('reports switching back from the challenge picker to practice', () => {
      renderInterventionBox();
      fireEvent.click(
        screen.getByRole('button', {name: /I want a challenge instead/i}),
      );
      fireEvent.click(screen.getByRole('button', {name: 'review instead'}));

      expect(sendEvent).toHaveBeenCalledWith(
        EVENTS.TUTOR_PLUS_NEXT_STEP_CHOSEN,
        {lesson_id: LESSON_ID, choice: 'practice', source: 'challenge_screen'},
      );
    });

    it('reports the challenge type and the started challenge', () => {
      renderInterventionBox();
      fireEvent.click(
        screen.getByRole('button', {name: /I want a challenge instead/i}),
      );
      fireEvent.click(screen.getByRole('button', {name: 'pick whiteboard'}));
      fireEvent.click(screen.getByRole('button', {name: 'start challenge'}));

      expect(sendEvent).toHaveBeenCalledWith(
        EVENTS.TUTOR_PLUS_CHALLENGE_TYPE_SELECTED,
        {lesson_id: LESSON_ID, type: 'whiteboard'},
      );
      expect(sendEvent).toHaveBeenCalledWith(
        EVENTS.TUTOR_PLUS_CHALLENGE_STARTED,
        {lesson_id: LESSON_ID, challenge_id: 5, type: 'whiteboard'},
      );
    });

    it('reports Done with the distinct modalities used and the time spent', () => {
      vi.useFakeTimers();
      try {
        renderInterventionBox({onDone: vi.fn()});
        fireEvent.click(screen.getByRole('button', {name: /Watch a video/i}));
        fireEvent.click(screen.getByRole('button', {name: /^Chat$/i}));
        fireEvent.click(screen.getByRole('button', {name: /^Video$/i}));
        vi.advanceTimersByTime(90_000);

        fireEvent.click(screen.getByRole('button', {name: /Done/i}));

        expect(sendEvent).toHaveBeenCalledWith(
          EVENTS.TUTOR_PLUS_PRACTICE_DONE,
          {
            lesson_id: LESSON_ID,
            modalities_used: ['videos', 'chat'],
            duration_seconds: 90,
          },
        );
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
