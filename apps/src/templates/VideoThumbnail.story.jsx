import React from 'react';
import VideoThumbnail from './VideoThumbnail';

export default storybook => {
  storybook
    .storiesOf('VideoThumbnail', module)
    .add(
      'Overview',
      () => (
        <VideoThumbnail
          video={{
            autoplay: true,
            download: "https://videos.code.org/2015/csp/applab/functions.mp4",
            enable_fallback: true,
            key: "csp_applab_functions",
            name: "Introduction to Functions",
            src: "https://www.youtube.com/embed/yPWQfa4CHbw/?autoplay=1&enablejsapi=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=1&v=yPWQfa4CHbw&wmode=transparent",
            thumbnail: "/c/video_thumbnails/160.jpg",
          }}
        />
      ),
    );
};
