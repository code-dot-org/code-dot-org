import React from 'react';
import {action} from '@storybook/addon-actions';
import StylizedBaseDialog from './StylizedBaseDialog';

const DEFAULT_PROPS = {
  title: 'Title',
  body: <div>body</div>,
  handleConfirmation: action('confirmed'),
  handleClose: action('closed'),
  hideBackdrop: true
};

export default storybook => {
  return storybook
    .storiesOf('Dialogs/StylizedBaseDialog', module)
    .addStoryTable([
      {
        name: 'Default',
        story: () => <StylizedBaseDialog {...DEFAULT_PROPS} />
      },
      {
        name: 'Left-justified footer buttons',
        story: () => (
          <StylizedBaseDialog
            {...DEFAULT_PROPS}
            footerJustification="flex-start"
          />
        )
      },
      {
        name: 'Custom footer button text',
        story: () => (
          <StylizedBaseDialog
            {...DEFAULT_PROPS}
            confirmationButtonText="Yes, please"
            cancellationButtonText="No, thank you"
          />
        )
      },
      {
        name: 'Custom footer with default buttons',
        story: () => (
          <StylizedBaseDialog
            {...DEFAULT_PROPS}
            footerJustification="space-between"
            renderFooter={buttons => [
              <div key="text">You can do it!</div>,
              <div key="buttons">{buttons}</div>
            ]}
          />
        )
      },
      {
        name: 'Custom footer without default buttons',
        story: () => (
          <StylizedBaseDialog
            {...DEFAULT_PROPS}
            renderFooter={() => "I don't need your buttons!"}
          />
        )
      }
    ]);
};
