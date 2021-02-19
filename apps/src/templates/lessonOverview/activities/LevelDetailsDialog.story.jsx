import React from 'react';
import LevelDetailsDialog from './LevelDetailsDialog';

const defaultProps = {
  handleClose: () => {
    console.log('closed');
  }
};

const standaloneVideoScriptLevel = {
  url: '/s/csd2-2021/stage/3/puzzle/6',
  level: {
    type: 'StandaloneVideo',
    longInstructions:
      '## Questions to consider:\n* What is debugging?\n* What are the four steps to debugging?',
    videoOptions: {
      autoplay: false,
      download: 'https://videos.code.org/levelbuilder/debugging_sm-mp4.mp4',
      enable_fallback: true,
      key: 'csd_debugging',
      name: 'Debugging',
      src:
        'https://www.youtube-nocookie.com/embed/auv10y-dN4s/?autoplay=0&enablejsapi=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=1&v=auv10y-dN4s&wmode=transparent',
      thumbnail: 'studio.code.org/c/video_thumbnails/csd_debugging.jpg'
    }
  }
};

const externalMarkdownScriptLevel = {
  url: '/s/csd5-2021/stage/10/puzzle/1',
  level: {
    type: 'External',
    markdown:
      '## Best Class Pet \n### Here are three different ways to show the results of a vote for best class pet.'
  }
};

const levelGroupScriptLevel = {
  url: '/s/csd6-2020/stage/16/puzzle/9/page/1',
  level: {
    type: 'LevelGroup'
  }
};

export default storybook => {
  storybook.storiesOf('LevelDetailsDialog', module).addStoryTable([
    {
      name: 'StandaloneVideo',
      story: () => (
        <LevelDetailsDialog
          {...defaultProps}
          scriptLevel={standaloneVideoScriptLevel}
        />
      )
    },
    {
      name: 'External',
      story: () => (
        <LevelDetailsDialog
          {...defaultProps}
          scriptLevel={externalMarkdownScriptLevel}
        />
      )
    },
    {
      name: 'LevelGroup',
      story: () => (
        <LevelDetailsDialog
          {...defaultProps}
          scriptLevel={levelGroupScriptLevel}
        />
      )
    }
  ]);
};
