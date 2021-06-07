import React from 'react';

import CollapserIcon from './CollapserIcon';

const styles = {
  background: {
    position: 'relative'
  }
};

export default storybook => {
  return storybook.storiesOf('CollapserIcon', module).addStoryTable([
    {
      name: 'CollapserIcon default, expanded',
      story: () => (
        <div style={styles.background}>
          <CollapserIcon onClick={() => {}} isCollapsed={false} />
        </div>
      )
    },
    {
      name: 'CollapserIcon default, collapsed',
      story: () => (
        <div style={styles.background}>
          <CollapserIcon onClick={() => {}} isCollapsed={true} />
        </div>
      )
    },
    {
      name: 'CollapserIcon different icon, expanded',
      story: () => (
        <div style={styles.background}>
          <CollapserIcon
            onClick={() => {}}
            isCollapsed={false}
            expandedIconClass="fa-caret-down"
          />
        </div>
      )
    },
    {
      name: 'CollapserIcon custom style, expanded',
      story: () => (
        <div style={styles.background}>
          <CollapserIcon
            onClick={() => {}}
            isCollapsed={false}
            style={{color: 'red'}}
          />
        </div>
      )
    }
  ]);
};
