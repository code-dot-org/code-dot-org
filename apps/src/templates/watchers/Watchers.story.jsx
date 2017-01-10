import React from 'react';
import Immutable from 'immutable';
import {Watchers} from './Watchers';

export default storybook => {
  storybook
    .storiesOf('Watchers', module)
    .addStoryTable([
      {
        name: 'with no watchers',
        story: () => (
          <div style={{width: 100, height: 100}}>
            <Watchers
              watchedExpressions={[]}
              isRunning={true}
            />
          </div>
        )
      },
      {
        name: 'with one watcher',
        story: () => (
          <div style={{width: 100, height: 100}}>
            <Watchers
              watchedExpressions={Immutable.fromJS([{expression: 'cool', uuid: 1234}])}
              isRunning={true}
            />
          </div>
        )
      },
    ]);
};
