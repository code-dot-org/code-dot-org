import {render, screen} from '@testing-library/react';
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

  it('renders TutorVideo for each entry in jsonVideos', () => {
    render(<VideosBox jsonVideos={VIDEOS} />);
    expect(mockTutorVideo).toHaveBeenCalledTimes(2);
  });

  it('renders the description text under each video', () => {
    render(<VideosBox jsonVideos={VIDEOS} />);
    expect(screen.getByText('First video')).toBeInTheDocument();
    expect(screen.getByText('Second video')).toBeInTheDocument();
  });

  it('passes the url to each TutorVideo', () => {
    render(<VideosBox jsonVideos={VIDEOS} />);
    expect(mockTutorVideo).toHaveBeenCalledWith(
      expect.objectContaining({href: '/json_videos/video-1/content'})
    );
    expect(mockTutorVideo).toHaveBeenCalledWith(
      expect.objectContaining({href: '/json_videos/video-2/content'})
    );
  });

  it('renders nothing when jsonVideos is empty', () => {
    render(<VideosBox jsonVideos={[]} />);
    expect(mockTutorVideo).not.toHaveBeenCalled();
  });
});
