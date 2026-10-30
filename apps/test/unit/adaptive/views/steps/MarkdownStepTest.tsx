import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {MarkdownStep as MarkdownStepContent} from '@cdo/apps/adaptive/types';
import MarkdownStep from '@cdo/apps/adaptive/views/steps/MarkdownStep';

// jsdom lays nothing out; give the canvas a host to size against.
jest.mock('@cdo/apps/util/hooks/useElementSize', () => ({
  __esModule: true,
  default: () => [1200, 800],
}));

const step: MarkdownStepContent = {
  id: 'card',
  title: 'Welcome',
  kind: 'markdown',
  markdown:
    "You've seen what's possible.\n\n## Welcome to the Skill Check\n\nFour quick questions.",
};

describe('MarkdownStep', () => {
  it('renders the markdown and advances on the button', () => {
    const onComplete = jest.fn();
    render(
      <MarkdownStep
        step={step}
        continueLabel="Continue"
        onComplete={onComplete}
      />
    );
    expect(
      screen.getByRole('heading', {name: 'Welcome to the Skill Check'})
    ).toBeTruthy();
    expect(screen.getByText('Four quick questions.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('keeps a lone newline as a line break', () => {
    render(
      <MarkdownStep
        step={{...step, markdown: 'One line.\nNext line.'}}
        continueLabel="Continue"
        onComplete={jest.fn()}
      />
    );
    expect(document.querySelector('br')).not.toBeNull();
  });

  it("labels the button with the step's own label when it has one", () => {
    render(
      <MarkdownStep
        step={{...step, continueLabel: 'Start Skill Check'}}
        continueLabel="Continue"
        onComplete={jest.fn()}
      />
    );
    expect(
      screen.getByRole('button', {name: 'Start Skill Check'})
    ).toBeTruthy();
  });
});
