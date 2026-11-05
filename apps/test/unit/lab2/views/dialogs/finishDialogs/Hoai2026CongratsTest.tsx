import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import Hoai2026Congrats from '@cdo/apps/lab2/views/dialogs/finishDialogs/Hoai2026Congrats';

describe('Hoai2026Congrats', () => {
  const renderDialog = (
    props: Partial<React.ComponentProps<typeof Hoai2026Congrats>> = {}
  ) =>
    render(
      <Hoai2026Congrats
        onClose={jest.fn()}
        shareUrl="https://studio.code.org/projects/spritelab2/abc"
        projectType="spritelab"
        {...props}
      />
    );

  it('offers the next steps for students and teachers', () => {
    renderDialog();
    expect(
      screen.getByRole('dialog', {name: 'Congratulations!'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {name: 'Make your own game in Sprite Lab'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {name: 'Bring AI to your classroom'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /How AI Makes Decisions/})
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Copy link'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Certificate'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Start AI 101'})
    ).toBeInTheDocument();
  });

  it('says so instead of offering a link when the game cannot be shared', () => {
    renderDialog({shareUrl: undefined});
    expect(screen.queryByRole('button', {name: 'Copy link'})).toBeNull();
    expect(
      screen.getByText("This game can't be shared right now.")
    ).toBeInTheDocument();
  });

  it('closes on Keep playing', () => {
    const onClose = jest.fn();
    renderDialog({onClose});
    screen.getByRole('button', {name: 'Keep playing'}).click();
    expect(onClose).toHaveBeenCalled();
  });
});
