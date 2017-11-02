import React from 'react';
import Immutable from 'immutable';
import {UnconnectedWatchers as Watchers} from './Watchers';

export default storybook => {
  const defaultProps = {
    debugButtons: false,
    add: () => {},
    update: () => {},
    remove: () => {},
  };

  storybook
    .storiesOf('Watchers', module)
    .addStoryTable([
      {
        name: 'with no watchers',
        story: () => (
          <div style={{width: 100, height: 100}}>
            <Watchers
              {...defaultProps}
              watchedExpressions={Immutable.List()}
              isRunning={true}
              appType="gamelab"
            />
          </div>
        )
      },
      {
        name: 'with one watcher',
        story: () => (
          <div style={{width: 100, height: 100}}>
            <Watchers
              {...defaultProps}
              watchedExpressions={Immutable.fromJS([{expression: 'cool', uuid: 1234}])}
              isRunning={true}
              appType="gamelab"
            />
          </div>
        )
      },
    ]);
};
