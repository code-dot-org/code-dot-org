import React from 'react';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '../redux';
import * as commonReducers from '../redux/commonReducers';
import GameButtons, {RunButton, ResetButton} from './GameButtons';

registerReducers(commonReducers);


export default function (storybook) {
  RunButton.displayName = 'RunButton';
  ResetButton.displayName = 'ResetButton';
  module.exports.styleGuideExamples = storybook => {
    storybook
      .storiesOf('RunButton', module)
      .addStoryTable([
        {
          name: 'default',
          description: 'The way the button is rendered with only default props',
          story: () => <RunButton />,
        },
        {
          name: 'minecraft version',
          description: 'this is special for some reason',
          story: () => <RunButton isMinecraft/>,
        },
      ]);

    storybook
      .storiesOf('ResetButton', module)
      .addStoryTable([
        {
          name: 'default',
          description: 'You have to explicitly set display: block to make this show up. It is hidden by default?!',
          story: () => <ResetButton style={{display: 'block'}} />
        },
        {
          name: 'text hidden',
          description: 'You can hide the text with the hideText prop',
          story: () => <ResetButton style={{display: 'block'}} hideText />
        }
      ]);

    storybook
      .storiesOf('GameButtons', module)
      .addStoryTable([
        {
          name: 'default',
          description: 'You have to explicitly set display: block to make this show up. It is hidden by default?!',
          story: () => (
            <Provider store={getStore()}>
              <GameButtons />
            </Provider>
          ),
        },
      ]);

  };
}
