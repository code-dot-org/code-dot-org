import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import Immutable from 'immutable';
import React from 'react';

import {UnconnectedWatchers as Watchers} from '@cdo/apps/code-studio/jsdebugger/Watchers';

describe('Watchers', () => {
  const defaultProps = {
    debugButtons: false,
    add: () => {},
    update: () => {},
    remove: () => {},
  };

  it('renders with no watchers', () => {
    shallow(
      <Watchers
        {...defaultProps}
        watchedExpressions={Immutable.List()}
        isRunning={true}
        appType="gamelab"
      />
    );
  });

  it('renders with one watcher', () => {
    shallow(
      <Watchers
        {...defaultProps}
        watchedExpressions={Immutable.fromJS([
          {expression: 'cool', uuid: 1234},
        ])}
        isRunning={true}
        appType="gamelab"
      />
    );
  });
});
