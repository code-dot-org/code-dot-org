import {fireEvent, render, screen} from '@testing-library/react';
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
        onRemix={jest.fn()}
        certificateUrl="/congrats?s=hoai2026-dev"
        {...props}
      />
    );

  it('offers the next steps for students and teachers', () => {
    renderDialog();
    expect(
      screen.getByRole('dialog', {name: 'Congratulations!'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Discover even more blocks in Sprite Lab',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {name: 'Bring AI to your classroom'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /How AI Makes Decisions/})
    ).toHaveAttribute(
      'href',
      'https://studio.code.org/courses/k5-ai-data-2024/units/1/reset'
    );
    expect(screen.getByRole('link', {name: /AI Discoveries/})).toHaveAttribute(
      'href',
      'https://code.org/en-US/curriculum/artificial-intelligence-discoveries'
    );
    expect(screen.getByRole('button', {name: 'Copy link'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Certificate'})).toHaveAttribute(
      'href',
      '/congrats?s=hoai2026-dev'
    );
    expect(screen.getByRole('link', {name: 'Learn more'})).toHaveAttribute(
      'href',
      'https://code.org/en-US/professional-learning'
    );
  });

  it('opens a remix of the game from the student card', () => {
    const onRemix = jest.fn();
    renderDialog({onRemix});
    fireEvent.click(screen.getByRole('button', {name: 'Open Sprite Lab'}));
    expect(onRemix).toHaveBeenCalledTimes(1);
  });

  it('offers the certificate as a plain button when the unit has no finish URL', () => {
    renderDialog({certificateUrl: undefined});
    expect(screen.queryByRole('link', {name: 'Certificate'})).toBeNull();
    expect(
      screen.getByRole('button', {name: 'Certificate'})
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
