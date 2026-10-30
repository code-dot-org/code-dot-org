import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import VideosBox from '@cdo/apps/aiTutor/views/lessonDeepDive/ReviewModalities/VideosBox';

const mockTutorVideo = jest.fn();

jest.mock('@cdo/apps/jsonVideo/TutorVideo', () => ({
  __esModule: true,
  default: (props: {href: string}) => {
    mockTutorVideo(props);
    return null;
  },
}));

const VIDEOS = [
  {
    key: 'video-1',
    url: '/json_videos/video-1/content',
    description: 'First video',
  },
  {
    key: 'video-2',
    url: '/json_videos/video-2/content',
    description: 'Second video',
  },
];

describe('VideosBox', () => {
  beforeEach(() => {
    mockTutorVideo.mockClear();
  });

  describe('with a single video', () => {
    const ONE_VIDEO = [VIDEOS[0]];

    it('renders the video and its description', () => {
      render(<VideosBox jsonVideos={ONE_VIDEO} />);
      expect(mockTutorVideo).toHaveBeenCalledTimes(1);
      expect(mockTutorVideo).toHaveBeenCalledWith(
        expect.objectContaining({href: '/json_videos/video-1/content'})
      );
      expect(screen.getByText('First video')).toBeInTheDocument();
    });

    it('does not render carousel navigation', () => {
      render(<VideosBox jsonVideos={ONE_VIDEO} />);
      expect(
        screen.queryByRole('button', {name: 'Next video'})
      ).not.toBeInTheDocument();
    });
  });

  describe('with multiple videos', () => {
    it('shows only the first video initially', () => {
      render(<VideosBox jsonVideos={VIDEOS} />);
      expect(mockTutorVideo).toHaveBeenCalledTimes(1);
      expect(mockTutorVideo).toHaveBeenCalledWith(
        expect.objectContaining({href: '/json_videos/video-1/content'})
      );
      expect(screen.getByText('First video')).toBeInTheDocument();
      expect(screen.queryByText('Second video')).not.toBeInTheDocument();
    });

    it('advances to the next video when clicking the next button', () => {
      render(<VideosBox jsonVideos={VIDEOS} />);
      fireEvent.click(screen.getByRole('button', {name: 'Next video'}));

      expect(mockTutorVideo).toHaveBeenLastCalledWith(
        expect.objectContaining({href: '/json_videos/video-2/content'})
      );
      expect(screen.getByText('Second video')).toBeInTheDocument();
      expect(screen.queryByText('First video')).not.toBeInTheDocument();
    });

    it('wraps from the last video back to the first', () => {
      render(<VideosBox jsonVideos={VIDEOS} />);
      fireEvent.click(screen.getByRole('button', {name: 'Previous video'}));

      expect(mockTutorVideo).toHaveBeenLastCalledWith(
        expect.objectContaining({href: '/json_videos/video-2/content'})
      );
      expect(screen.getByText('Second video')).toBeInTheDocument();
    });

    it('jumps to a video when its dot is clicked', () => {
      render(<VideosBox jsonVideos={VIDEOS} />);
      fireEvent.click(screen.getByRole('button', {name: 'Video 2 of 2'}));

      expect(mockTutorVideo).toHaveBeenLastCalledWith(
        expect.objectContaining({href: '/json_videos/video-2/content'})
      );
      expect(screen.getByText('Second video')).toBeInTheDocument();
    });

    it('renders one dot per video', () => {
      render(<VideosBox jsonVideos={VIDEOS} />);
      expect(
        screen.getByRole('button', {name: 'Video 1 of 2'})
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Video 2 of 2'})
      ).toBeInTheDocument();
    });
  });

  it('renders nothing when jsonVideos is empty', () => {
    render(<VideosBox jsonVideos={[]} />);
    expect(mockTutorVideo).not.toHaveBeenCalled();
  });
});
