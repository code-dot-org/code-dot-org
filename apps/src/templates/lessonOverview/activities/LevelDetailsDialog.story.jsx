import React from 'react';
import {UnconnectedLevelDetailsDialog as LevelDetailsDialog} from './LevelDetailsDialog';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/code-studio/redux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

const defaultProps = {
  handleClose: () => {
    console.log('closed');
  },
  viewAs: ViewType.Teacher,
  isRtl: false
};

const standaloneVideoScriptLevel = {
  url: '/s/csd2-2021/lessons/3/levels/6',
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
  url: '/s/csd5-2021/lessons/10/levels/1',
  level: {
    type: 'External',
    markdown:
      '## Best Class Pet \n### Here are three different ways to show the results of a vote for best class pet.'
  }
};

const levelGroupScriptLevel = {
  url: '/s/csd6-2020/lessons/16/levels/9/page/1',
  level: {
    type: 'LevelGroup'
  }
};

const bubbleChoiceScriptLevel = {
  url: '/s/csd6-2020/lessons/16/levels/9/page/1',
  levelNumber: 2,
  icon: 'fa-sitemap',
  id: 'scriptlevel',
  status: 'not_tried',
  level: {
    type: 'BubbleChoice',
    name: 'parentLevel'
  },
  sublevels: [
    {
      type: 'External',
      markdown:
        '## Best Class Pet \n### Here are three different ways to show the results of a vote for best class pet.',
      thumbnail_url:
        'https://images.code.org/c1fb2198202517b8ddfe3ccb9865ca3e-image-1562863985170.JPG',
      long_instructions:
        '## Best Class Pet \n### Here are three different ways to show the results of a vote for best class pet.',
      letter: 'a',
      name: 'sublevel1',
      id: 'sublevel1',
      status: 'not_tried'
    },
    {
      type: 'External',
      markdown:
        '## Wiring Up the UI\nWith your user interface in place, you can now add event handlers for your interface elements. At this point you may want to just include console.log() commands to make sure that your events are working as expected - you can add the functional code later one.',
      thumbnail_url:
        'https://images.code.org/55d1b7020f9ab14d733697ebd53eea6c-image-1561698487741.07.21 PM.png',
      long_instructions:
        '## Best Class Pet \n### Here are three different ways to show the results of a vote for best class pet.',
      letter: 'b',
      name: 'sublevel2',
      id: 'sublevel2',
      status: 'not_tried'
    }
  ]
};

const levelWithInstructions = {
  url: '/s/csd6-2020/lessons/16/levels/9/page/1',
  level: {
    type: 'Weblab',
    longInstructions:
      'These are some long instructions!\n**Do this**\nSome more detailed instructions.',
    teacherMarkdown: 'Just some markdown for teachers.',
    mapReference: '/docs/csd-1718/html_tags/index.html',
    videos: [
      {
        autoplay: true,
        download:
          'https://videos.code.org/levelbuilder/weblab_introtohtml-mp4.mp4',
        enable_fallback: true,
        key: 'csd_weblab_intro_2',
        name: 'Intro to Web Lab - Part 2',
        src:
          'https://www.youtube-nocookie.com/embed/Hjl6gbg9kmk/?autoplay=1&enablejsapi=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=1&v=Hjl6gbg9kmk&wmode=transparent',
        thumbnail: '/c/video_thumbnails/csd_weblab_intro_2.jpg'
      }
    ]
  }
};

const levelWithContainedLevel = {
  url: '/s/coursef-2021/lessons/2/levels/2',
  level: {
    type: 'GamelabJr',
    containedLevels: [
      {
        name: 'contained-free-response-level',
        type: 'FreeResponse',
        longInstructions:
          '**Make a prediction**: What do you think will happen when you run this code?'
      }
    ]
  }
};

export default storybook => {
  storybook
    .storiesOf('LevelDetailsDialog', module)
    .withReduxStore()
    .addStoryTable([
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
      },
      {
        name: 'BubbleChoice',
        story: () => (
          <LevelDetailsDialog
            {...defaultProps}
            scriptLevel={bubbleChoiceScriptLevel}
          />
        )
      },
      {
        name: 'Contained Levels',
        story: () => (
          <Provider store={getStore()}>
            <LevelDetailsDialog
              {...defaultProps}
              scriptLevel={levelWithContainedLevel}
            />
          </Provider>
        )
      },
      {
        name: 'TopInstructions',
        story: () => (
          <Provider store={getStore()}>
            <LevelDetailsDialog
              {...defaultProps}
              scriptLevel={levelWithInstructions}
            />
          </Provider>
        )
      },
      {
        name: 'TopInstructions RTL',
        story: () => (
          <Provider store={getStore()}>
            <LevelDetailsDialog
              {...defaultProps}
              isRtl
              scriptLevel={levelWithInstructions}
            />
          </Provider>
        )
      }
    ]);
};
