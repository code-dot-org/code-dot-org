import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {MarkdownStep as MarkdownStepContent} from '@cdo/apps/adaptive/types';
import MarkdownStep from '@cdo/apps/adaptive/views/steps/MarkdownStep';

// jsdom lays nothing out; give the canvas a host to size against. A test
// may start it unmeasured, as a real host is on first render.
let mockHostSize = [1200, 800];
jest.mock('@cdo/apps/util/hooks/useElementSize', () => ({
  __esModule: true,
  default: () => mockHostSize,
}));

const step: MarkdownStepContent = {
  id: 'card',
  title: 'Welcome',
  kind: 'markdown',
  markdown:
    "You've seen what's possible.\n\n## Welcome to the Skill Check\n\nFour quick questions.",
};

describe('MarkdownStep', () => {
  afterEach(() => {
    mockHostSize = [1200, 800];
  });

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

  it('renders an image from the markdown and an outside link beside the button', () => {
    render(
      <MarkdownStep
        step={{
          ...step,
          markdown:
            '## Done\n\n![A student presents](https://example.com/x.png)\n\nNext steps.',
          link: {label: 'Learn more', href: 'https://code.org'},
          continueLabel: 'Get my Certificate',
        }}
        continueLabel="Continue"
        onComplete={jest.fn()}
      />
    );
    const image = screen.getByRole('img', {name: 'A student presents'});
    expect(image.getAttribute('src')).toBe('https://example.com/x.png');
    const link = screen.getByRole('link', {name: 'Learn more'});
    expect(link.getAttribute('href')).toBe('https://code.org');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(
      screen.getByRole('button', {name: 'Get my Certificate'})
    ).toBeTruthy();
  });

  it('keeps the height written on an image tag, over the site stylesheet', () => {
    render(
      <MarkdownStep
        step={{
          ...step,
          markdown:
            '<img src="https://example.com/x.png" alt="" width="800" height="400">',
        }}
        continueLabel="Continue"
        onComplete={jest.fn()}
      />
    );
    const image = document.querySelector('img') as HTMLImageElement;
    expect(image.getAttribute('height')).toBe('400');
    expect(image.style.height).toBe('400px');
  });

  it('keeps a lone newline as a line break, and a blank line as a paragraph break', () => {
    render(
      <MarkdownStep
        step={{...step, markdown: 'One line.\nNext line.\n\nNew paragraph.'}}
        continueLabel="Continue"
        onComplete={jest.fn()}
      />
    );
    expect(document.querySelectorAll('br')).toHaveLength(1);
    expect(document.querySelectorAll('p')).toHaveLength(2);
  });

  it('focuses the canvas once the host has been measured', () => {
    // A fresh element each time: React skips a component handed the same one.
    const card = () => (
      <MarkdownStep
        step={step}
        continueLabel="Continue"
        onComplete={jest.fn()}
      />
    );
    mockHostSize = [0, 0];
    const {rerender} = render(card());
    expect(document.activeElement).toBe(document.body);

    mockHostSize = [1200, 800];
    rerender(card());
    expect(document.activeElement?.textContent).toContain(
      'Welcome to the Skill Check'
    );
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
