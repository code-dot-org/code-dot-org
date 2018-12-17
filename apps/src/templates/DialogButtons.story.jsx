import React from 'react';
import DialogButtons from './DialogButtons';

export default storybook => {
    storybook
      .deprecatedStoriesOf(
        'Buttons/DialogButtons',
        module,
        {
          reason: "The component had way too many properties",
          replacement: "Button",
        })
      .addStoryTable([
        {
          name: 'ok',
          story: () => <DialogButtons ok={true}/>
        }, {
          name: 'cancelText',
          story: () => <DialogButtons cancelText="Custom Cancel Text"/>,
        }, {
          name: 'confirmText',
          story: () => <DialogButtons confirmText="Custom Confirm Text"/>,
        }, {
          name: 'nextLevel',
          story: () => <DialogButtons nextLevel={true} continueText="Custom Continue Text"/>,
        }, {
          name: 'tryAgain',
          story: () => <DialogButtons tryAgain="Custom Try Again Text"/>,
        }, {
          name: 'tryAgain with hint',
          story: () => <DialogButtons shouldPromptForHint={true} tryAgain="Custom Try Again Text"/>,
        }, {
          name: 'K1 customizations',
          description: 'To use k1 customization, you must pass an assetUrl function.',
          story: () => (
            <DialogButtons
              isK1={true}
              tryAgain="Custom Try Again"
              nextLevel={true}
              continueText="Custom Continue"
              assetUrl={url => '/blockly/'+url}
            />
          ),
        }, {
          name: 'K1 freePlay',
          description: 'To use k1 customization, you must pass an assetUrl function.',
          story: () => (
            <DialogButtons
              isK1={true}
              freePlay={true}
              tryAgain="Custom Try Again"
              nextLevel={true}
              continueText="Custom Continue"
              assetUrl={url => '/blockly/'+url}
            />
          ),
        }
      ]);
  };
