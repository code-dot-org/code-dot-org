import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import Video from '@/video';

describe('Video Component', () => {
  it('renders a YouTube video', async () => {
    render(
      <Video
        youTubeId="nKIu9yen5nc"
        videoTitle="What Most Schools Don't Teach"
      />,
    );

    const iframe = await screen.findByTitle("What Most Schools Don't Teach");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/nKIu9yen5nc',
    );
  });

  it('renders a caption', () => {
    render(
      <Video
        youTubeId="nKIu9yen5nc"
        videoTitle="What Most Schools Don't Teach"
        showCaption
      />,
    );

    const caption = screen.getByText("What Most Schools Don't Teach");
    expect(caption).toBeInTheDocument();
  });

  it('renders a download button when fallback video is provided', () => {
    render(
      <Video
        youTubeId="nKIu9yen5nc"
        videoFallback="https://videos.code.org/social/what-most-schools-dont-teach.mp4"
      />,
    );

    const downloadButton = screen.getByRole('link', {name: 'Download'});
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveAttribute(
      'href',
      'https://videos.code.org/social/what-most-schools-dont-teach.mp4',
    );
  });
});
