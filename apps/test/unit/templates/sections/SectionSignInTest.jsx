import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import SectionSignIn from '@cdo/apps/templates/sections/SectionSignIn';

const STUDENTS = [
  {id: 236, name: 'Jamie'},
  {id: 237, name: 'Riley'},
];

const PICTURES = [
  {id: 1, path: '/img/alien.png', name: 'alien'},
  {id: 2, path: '/img/ghost.png', name: 'ghost'},
];

const PAIRING_LABEL = 'I have a partner at my computer';

const BASE_PROPS = {
  submitPath: '/sections/ABC123/log_in',
  authenticityToken: 'csrf-token-123',
  welcome: 'Welcome to Music section',
  nameInstruction: 'Choose your name*',
  pictureInstruction: 'Now find your secret picture',
  wordInstruction: 'Now type your secret words',
  pairProgramming: PAIRING_LABEL,
  loginLabel: 'Sign in',
  signingInLabel: 'Signing in',
  students: STUDENTS,
  secretPictures: PICTURES,
  loginType: 'picture',
  loginTypePicture: 'picture',
  loginTypeWord: 'word',
  pairingAllowed: true,
};

function renderComponent(overrides = {}) {
  return render(<SectionSignIn {...BASE_PROPS} {...overrides} />);
}

const selectName = name =>
  fireEvent.click(screen.getByRole('checkbox', {name}));
const selectPicture = altName =>
  fireEvent.click(screen.getByRole('button', {name: altName}));
const submitButton = () => screen.getByRole('button', {name: 'Sign in'});

describe('SectionSignIn', () => {
  it('hides the secret picker and submit until a name is chosen', () => {
    renderComponent();
    screen.getByText('Welcome to Music section');
    screen.getByRole('checkbox', {name: 'Jamie'});
    expect(screen.queryByAltText('alien')).toBeNull();
    expect(screen.queryByRole('button', {name: 'Sign in'})).toBeNull();
  });

  it('reveals the secret pictures and a disabled submit after a name is chosen', () => {
    renderComponent();
    selectName('Jamie');

    screen.getByAltText('alien');
    screen.getByAltText('ghost');
    expect(submitButton()).toBeDisabled();
  });

  it('enables submit and shows the pairing checkbox after a picture is chosen', () => {
    renderComponent();
    selectName('Jamie');
    selectPicture('alien');

    expect(submitButton()).not.toBeDisabled();
    screen.getByRole('checkbox', {name: PAIRING_LABEL});
  });

  it('resets the secret selection when a different name is chosen', () => {
    renderComponent();
    selectName('Jamie');
    selectPicture('alien');
    expect(submitButton()).not.toBeDisabled();

    selectName('Riley');

    expect(submitButton()).toBeDisabled();
    expect(screen.queryByRole('checkbox', {name: PAIRING_LABEL})).toBeNull();
  });

  it('does not show the pairing checkbox when pairing is not allowed', () => {
    renderComponent({pairingAllowed: false});
    selectName('Jamie');
    selectPicture('alien');

    expect(submitButton()).not.toBeDisabled();
    expect(screen.queryByRole('checkbox', {name: PAIRING_LABEL})).toBeNull();
  });

  it('word login: typing the secret word enables submit', () => {
    renderComponent({loginType: 'word'});
    selectName('Jamie');

    expect(screen.queryByAltText('alien')).toBeNull();
    expect(submitButton()).toBeDisabled();

    fireEvent.change(screen.getByRole('textbox'), {
      target: {value: 'open sesame'},
    });
    expect(submitButton()).not.toBeDisabled();
  });

  it('disables the submit button and swaps the label on submit', () => {
    renderComponent();
    selectName('Jamie');
    selectPicture('alien');
    expect(submitButton()).not.toBeDisabled();

    fireEvent.click(submitButton());

    expect(screen.getByRole('button', {name: 'Signing in'})).toBeDisabled();
  });
});
