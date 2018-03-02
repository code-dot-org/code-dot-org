import React from 'react';
import Dialog, {Icon, Title, Body, Buttons, Cancel, Confirm, Footer} from './Dialog';
import ExampleDialogButton from '../util/ExampleDialogButton';
import {action} from '@storybook/addon-actions';

export default storybook => {
  return storybook
    .storiesOf('Dialogs/Dialog', module)
    .addStoryTable([
      {
        name: 'basic example',
        description: `The most common scenario is to create a straightforward dialog
                        with an icon, a title, some body content, and a cancel/confirm
                        button. You can do this easily by simply passing the relevant props`,
        story: () => (
          <Dialog
            hideBackdrop={true}
            icon="https://studio.code.org/blockly/media/skins/flappy/static_avatar.png"
            title="Puzzle 3 of 10"
            cancelText="Go Back"
            body='The "when run" block allows you to run code when your game starts.
                  Try setting the level speed and flapping to the target.'
            footer="Try not to become too addicted to flappy bird"
            onCancel={action("go back")}
            onConfirm={action("confirm")}
          />
        )
      }, {
        name: 'basic example with dom',
        description: `If you need to monkey around with the components used to generate
                        the dom in the basic example, you can just specify the components
                        directly.`,
        story: () => (
          <Dialog hideBackdrop={true}>
            <Icon src="https://studio.code.org/blockly/media/skins/flappy/static_avatar.png"/>
            <Title>Puzzle 3 of 10</Title>
            <Body>
              The "when run" block allows you to run code when your game starts.
              Try setting the level speed and flapping to the target.
            </Body>
            <Buttons>
              <Cancel>Go Back</Cancel>
              <Confirm />
            </Buttons>
            <Footer>
              Try not to become too addicted to flappy bird
            </Footer>
          </Dialog>
        )
      }, {
        name: 'no icon',
        description: 'This is how the dialog looks when no icon is provided',
        story: () => (
          <Dialog
            hideBackdrop={true}
            title="Puzzle 3 of 10"
            cancelText="Go Back"
            body='The "when run" block allows you to run code when your game starts.
                  Try setting the level speed and flapping to the target.'
            footer="Try not to become too addicted to flappy bird"
            onCancel={action("go back")}
            onConfirm={action("confirm")}
          />
        )
      }, {
        name: 'no footer',
        description: 'This is how the dialog looks if you omit a footer',
        story: () => (
          <Dialog
            hideBackdrop={true}
            title="A big decision"
            body="Do you want to go skydiving?"
            confirmText="Yes"
            onCancel={action("cancel")}
            onConfirm={action("confirm")}
          />
        )
      }, {
        name: 'alternate confirm button type',
        description: 'This is how the dialog looks with confirm button of type "danger"',
        story: () => (
          <Dialog
            hideBackdrop={true}
            title="Delete table"
            body="Are you sure you want to delete the table?"
            confirmText="Delete"
            confirmType="danger"
            onCancel={action("cancel")}
            onConfirm={action("confirm")}
          />
        )
      }, {
        name: 'no title and only confirm',
        description: `This is how the dialog looks when you omit a title.
                        You can also omit buttons`,
        story: () => (
          <Dialog
            hideBackdrop={true}
            body="Just wanted to tell you something"
            confirmText="Ok"
            onConfirm={action("confirm")}
          />
        )
      }, {
        name: 'fullWidth',
        description: `In a few cases you'll want a dialog that can grow to
                        fill the browser width.`,
        story: () => (
          <ExampleDialogButton>
            <Dialog fullWidth={true}>
              <Icon src="https://studio.code.org/blockly/media/skins/flappy/static_avatar.png"/>
              <Title>Puzzle 3 of 10</Title>
              <Body>
                <table style={{width: '100%'}}>
                  <tr>
                    <th>Heading A</th>
                    <th>Heading B</th>
                    <th>Heading C</th>
                    <th>Heading D</th>
                    <th>Heading E</th>
                    <th>Heading F</th>
                  </tr>
                </table>
              </Body>
              <Buttons>
                <Cancel>Go Back</Cancel>
                <Confirm />
              </Buttons>
              <Footer>
                Try not to become too addicted to flappy bird
              </Footer>
            </Dialog>
          </ExampleDialogButton>
        )
      }
    ]);
};
