import React from 'react';
import PaneHeader from './PaneHeader';


export default storybook => {

  storybook
    .storiesOf('PaneHeader', module)
    .addStoryTable([
      {
        name:'PaneHeader - has focus',
        story: () => (
          <PaneHeader hasFocus={true}/>
        )
      },
      {
        name:'PaneHeader - does not have focus',
        story: () => (
          <PaneHeader hasFocus={false}/>
        )
      },
      {
        name:'PaneHeader - teacher only',
        story: () => (
          <PaneHeader hasFocus={true} teacherOnly={true}/>
        )
      },
    ]);
};
