import React from 'react';

import CollapserIcon from './CollapserIcon';

const styles = {
  background: {
    position: 'relative'
  }
};

export default storybook => {
  return storybook
    .storiesOf('CollapserIcon', module)
    .addStoryTable([
      {
        name: 'CollapserIcon in normal-mode, extended',
        story: () => (
          <div style={styles.background}>
            <CollapserIcon
              onClick={()=>{}}
              collapsed={false}
            />
          </div>
        )
      },
      {
        name: 'CollapserIcon in normal-mode, collapsed',
        story: () => (
          <div style={styles.background}>
            <CollapserIcon
              onClick={()=>{}}
              collapsed={true}
            />
          </div>
        )
      },
      {
        name: 'CollapserIcon in teacher-mode, extended',
        story: () => (
          <div style={styles.background}>
            <CollapserIcon
              onClick={()=>{}}
              collapsed={false}
              teacherOnly={true}
            />
          </div>
        )
      },
      {
        name: 'CollapserIcon in teacher-mode, collapsed',
        story: () => (
          <div style={styles.background}>
            <CollapserIcon
              onClick={()=>{}}
              collapsed={true}
              teacherOnly={true}
            />
          </div>
        )
      },
    ]);
};
