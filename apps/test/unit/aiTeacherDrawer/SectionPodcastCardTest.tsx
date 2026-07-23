import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import SectionPodcastCard from '@cdo/apps/aiTeacherDrawer/SectionPodcastCard';

jest.mock('@code-dot-org/teacher-dashboard/home', () => ({
  __esModule: true,
  default: ({color, emoji}: {color: number; emoji: number}) => (
    <span role="img" aria-label={`section-avatar-${color}-${emoji}`} />
  ),
}));

const PODCAST_URL = '/ai_lesson_summary_podcasts/show?lesson_id=42';

const LESSON_WITH_PODCAST = {
  lesson_id: 42,
  name: 'Lesson 3: Variables',
  podcast_url: PODCAST_URL,
};

const LESSON_WITHOUT_PODCAST = {
  lesson_id: 42,
  name: 'Lesson 3: Variables',
  podcast_url: null,
};

const DEFAULT_PROPS = {
  sectionName: 'Period 3: Physical Computing',
  avatarColor: 2,
  avatarEmoji: 5,
};

function audioEl(): HTMLAudioElement {
  const el = document.querySelector('audio');
  if (!el) throw new Error('No audio element in DOM');
  return el as HTMLAudioElement;
}

describe('SectionPodcastCard', () => {
  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = jest
      .fn()
      .mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('section row', () => {
    it('always renders the section name', () => {
      render(<SectionPodcastCard {...DEFAULT_PROPS} lesson={null} />);
      expect(
        screen.getByText('Period 3: Physical Computing')
      ).toBeInTheDocument();
    });

    it('renders the avatar with correct color and emoji props', () => {
      render(<SectionPodcastCard {...DEFAULT_PROPS} lesson={null} />);
      expect(
        screen.getByRole('img', {name: 'section-avatar-2-5'})
      ).toBeInTheDocument();
    });

    it('renders when lesson is undefined (fetch in flight)', () => {
      render(<SectionPodcastCard {...DEFAULT_PROPS} lesson={undefined} />);
      expect(
        screen.getByText('Period 3: Physical Computing')
      ).toBeInTheDocument();
    });
  });

  describe('podcast row visibility', () => {
    it('does not render when lesson is null', () => {
      render(<SectionPodcastCard {...DEFAULT_PROPS} lesson={null} />);
      expect(document.querySelector('audio')).toBeNull();
      expect(screen.queryByRole('button', {name: /play/i})).toBeNull();
    });

    it('does not render when lesson is undefined', () => {
      render(<SectionPodcastCard {...DEFAULT_PROPS} lesson={undefined} />);
      expect(document.querySelector('audio')).toBeNull();
    });

    it('does not render when lesson has no podcast_url', () => {
      render(
        <SectionPodcastCard
          {...DEFAULT_PROPS}
          lesson={LESSON_WITHOUT_PODCAST}
        />
      );
      expect(document.querySelector('audio')).toBeNull();
      expect(screen.queryByRole('button', {name: /play/i})).toBeNull();
    });

    it('renders immediately when lesson has a podcast_url', () => {
      render(
        <SectionPodcastCard {...DEFAULT_PROPS} lesson={LESSON_WITH_PODCAST} />
      );
      expect(document.querySelector('audio')).toBeInTheDocument();
      expect(screen.getByRole('button', {name: 'Play'})).toBeInTheDocument();
    });

    it('points the audio element at the podcast_url', () => {
      render(
        <SectionPodcastCard {...DEFAULT_PROPS} lesson={LESSON_WITH_PODCAST} />
      );
      expect(audioEl().getAttribute('src')).toBe(PODCAST_URL);
    });
  });

  describe('play button state', () => {
    it('is disabled before canplay fires', () => {
      render(
        <SectionPodcastCard {...DEFAULT_PROPS} lesson={LESSON_WITH_PODCAST} />
      );
      expect(screen.getByRole('button', {name: 'Play'})).toBeDisabled();
    });

    it('becomes enabled after canplay fires', async () => {
      render(
        <SectionPodcastCard {...DEFAULT_PROPS} lesson={LESSON_WITH_PODCAST} />
      );
      fireEvent.canPlay(audioEl());
      await waitFor(() =>
        expect(screen.getByRole('button', {name: 'Play'})).toBeEnabled()
      );
    });

    it('stays disabled when audio errors', async () => {
      render(
        <SectionPodcastCard {...DEFAULT_PROPS} lesson={LESSON_WITH_PODCAST} />
      );
      fireEvent.error(audioEl());
      await waitFor(() =>
        expect(screen.getByRole('button', {name: 'Play'})).toBeDisabled()
      );
    });
  });

  describe('playback controls', () => {
    async function renderReady() {
      render(
        <SectionPodcastCard {...DEFAULT_PROPS} lesson={LESSON_WITH_PODCAST} />
      );
      fireEvent.canPlay(audioEl());
      await waitFor(() =>
        expect(screen.getByRole('button', {name: 'Play'})).toBeEnabled()
      );
    }

    it('calls audio.play() when play button is clicked', async () => {
      await renderReady();
      fireEvent.click(screen.getByRole('button', {name: 'Play'}));
      expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    });

    it('switches to Pause button after play is clicked', async () => {
      await renderReady();
      fireEvent.click(screen.getByRole('button', {name: 'Play'}));
      expect(screen.getByRole('button', {name: 'Pause'})).toBeInTheDocument();
    });

    it('calls audio.pause() when pause button is clicked', async () => {
      await renderReady();
      fireEvent.click(screen.getByRole('button', {name: 'Play'}));
      fireEvent.click(screen.getByRole('button', {name: 'Pause'}));
      expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
    });

    it('updates currentTime when progress bar is clicked', async () => {
      await renderReady();

      Object.defineProperty(audioEl(), 'duration', {value: 200});
      fireEvent.durationChange(audioEl());

      const track = screen.getByRole('slider', {name: 'Playback position'});
      jest
        .spyOn(track, 'getBoundingClientRect')
        .mockReturnValue({left: 0, width: 200} as DOMRect);

      fireEvent.click(track, {clientX: 100});

      expect(audioEl().currentTime).toBeCloseTo(100);
    });
  });

  describe('completion', () => {
    it('shows the completed icon after the audio ends', async () => {
      render(
        <SectionPodcastCard {...DEFAULT_PROPS} lesson={LESSON_WITH_PODCAST} />
      );
      fireEvent.canPlay(audioEl());
      await waitFor(() =>
        expect(screen.getByRole('button', {name: 'Play'})).toBeEnabled()
      );

      fireEvent.ended(audioEl());

      await waitFor(() => {
        expect(
          document.querySelector('[class*="completedIcon"]')
        ).toBeInTheDocument();
      });
    });

    it('reverts to Play button after audio ends', async () => {
      render(
        <SectionPodcastCard {...DEFAULT_PROPS} lesson={LESSON_WITH_PODCAST} />
      );
      fireEvent.canPlay(audioEl());
      await waitFor(() =>
        expect(screen.getByRole('button', {name: 'Play'})).toBeEnabled()
      );

      fireEvent.click(screen.getByRole('button', {name: 'Play'}));
      expect(screen.getByRole('button', {name: 'Pause'})).toBeInTheDocument();

      fireEvent.ended(audioEl());
      await waitFor(() =>
        expect(screen.getByRole('button', {name: 'Play'})).toBeInTheDocument()
      );
    });
  });
});
