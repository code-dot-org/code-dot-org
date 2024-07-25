import {action} from '@storybook/addon-actions';
import React from 'react';

import ExampleDialogButton from '../util/ExampleDialogButton';

import Dialog, {
  Icon,
  Title,
  Body,
  Buttons,
  Cancel,
  Confirm,
  Footer,
} from './Dialog';

// There are so many different variations that making a template is not helpful
export default {
  component: Dialog,
};

/*
By passing the relevant props, you can create a straightforward dialog with an icon,
a title, body content, and a cancel/confirm button.
*/
export const BasicExample = () => (
  <Dialog
    hideBackdrop={true}
    icon="https://studio.code.org/blockly/media/skins/flappy/static_avatar.png"
    title="Puzzle 3 of 10"
    cancelText="Go Back"
    body='The "when run" block allows you to run code when your game starts.
                  Try setting the level speed and flapping to the target.'
    footer="Try not to become too addicted to flappy bird"
    onCancel={action('go back')}
    onConfirm={action('confirm')}
  />
);

/*
If you need to monkey around with the components used to generate the dom in the
basic example, just specify the components directly.
*/
export const BasicWithDom = () => (
  <Dialog hideBackdrop={true}>
    <Icon src="https://studio.code.org/blockly/media/skins/flappy/static_avatar.png" />
    <Title>Puzzle 3 of 10</Title>
    <Body>
      The "when run" block allows you to run code when your game starts. Try
      setting the level speed and flapping to the target.
    </Body>
    <Buttons>
      <Cancel>Go Back</Cancel>
      <Confirm />
    </Buttons>
    <Footer>Try not to become too addicted to flappy bird</Footer>
  </Dialog>
);

export const NoIcon = () => (
  <Dialog
    hideBackdrop={true}
    title="Puzzle 3 of 10"
    cancelText="Go Back"
    body='The "when run" block allows you to run code when your game starts.
                  Try setting the level speed and flapping to the target.'
    footer="Try not to become too addicted to flappy bird"
    onCancel={action('go back')}
    onConfirm={action('confirm')}
  />
);

export const NoFooter = () => (
  <Dialog
    hideBackdrop={true}
    title="A big decision"
    body="Do you want to go skydiving?"
    confirmText="Yes"
    onCancel={action('cancel')}
    onConfirm={action('confirm')}
  />
);

export const DangerConfirmButton = () => (
  <Dialog
    hideBackdrop={true}
    title="Delete table"
    body="Are you sure you want to delete the table?"
    confirmText="Delete"
    confirmType="danger"
    onCancel={action('cancel')}
    onConfirm={action('confirm')}
  />
);

export const NoTitleOnlyConfirm = () => (
  <Dialog
    hideBackdrop={true}
    body="Just wanted to tell you something"
    confirmText="Ok"
    onConfirm={action('confirm')}
  />
);

export const FullWidth = () => (
  <ExampleDialogButton>
    <Dialog fullWidth={true}>
      <Icon src="https://studio.code.org/blockly/media/skins/flappy/static_avatar.png" />
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
      <Footer>Try not to become too addicted to flappy bird</Footer>
    </Dialog>
  </ExampleDialogButton>
);
