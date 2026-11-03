import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {ModalStep as ModalStepContent} from '@cdo/apps/adaptive/types';
import ModalStep from '@cdo/apps/adaptive/views/steps/ModalStep';

const step: ModalStepContent = {
  id: 'finish-challenge',
  title: 'Challenge',
  kind: 'modal',
  heading: 'You just built something with AI!',
  imageUrl: 'https://example.com/x.png',
  markdown: 'Team up and enter.',
  link: {label: 'Learn more', href: 'https://code.org'},
  continueLabel: 'Get my Certificate',
};

describe('ModalStep', () => {
  it('shows the heading, image, text and link, and continues from its own button', () => {
    const onComplete = jest.fn();
    render(
      <ModalStep step={step} continueLabel="Continue" onComplete={onComplete} />
    );
    expect(
      screen.getByRole('heading', {name: 'You just built something with AI!'})
    ).toBeTruthy();
    expect(document.querySelector('img')?.getAttribute('src')).toBe(
      'https://example.com/x.png'
    );
    expect(screen.getByText('Team up and enter.')).toBeTruthy();
    const link = screen.getByRole('link', {name: 'Learn more'});
    expect(link.getAttribute('href')).toBe('https://code.org');
    expect(link.getAttribute('target')).toBe('_blank');
    fireEvent.click(screen.getByRole('button', {name: 'Get my Certificate'}));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("labels the button with the player's label when the step has none", () => {
    render(
      <ModalStep
        step={{...step, continueLabel: undefined, link: undefined}}
        continueLabel="Continue"
        onComplete={jest.fn()}
      />
    );
    expect(screen.getByRole('button', {name: 'Continue'})).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
