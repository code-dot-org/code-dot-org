import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';

import AiDiffWelcome from '@cdo/apps/aiDifferentiation/welcome/AiDiffWelcome';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn().mockResolvedValue({
    json: jest.fn().mockReturnValue({}),
  }),
}));

jest.mock('@react-pdf/renderer', () => {
  return {
    PDFDownloadLink: () => null,
    StyleSheet: {
      create: () => null,
    },
  };
});

jest.mock('@cdo/apps/aiDifferentiation/AiDiffChat', () => {
  return function MockAiDiffChat(props) {
    return (
      // eslint-disable-next-line react/prop-types
      <button onClick={props.chatResponseCallback} type="button">
        ai chat mocked
      </button>
    );
  };
});

jest.mock('react-dom-confetti', () => () => <div>confetti</div>);

const DEFAULT_PROPS = {
  setShowWelcomeExperience: () => {},
  context: 'some-context',
  scriptId: 1,
  scriptName: 'Test Script',
};

describe('AiDiffWelcome', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
  });

  test('renders get started page initially', () => {
    render(<AiDiffWelcome {...DEFAULT_PROPS} />);
    screen.getByText('AI Teaching Assistant');

    screen.getByText('Empowering teachers. Enhancing learning.');
    screen.getByRole('button', {name: 'Get Started'});
  });

  test('clicking "Get Started" transitions to select option page', () => {
    render(<AiDiffWelcome {...DEFAULT_PROPS} />);

    fireEvent.click(screen.getByText('Get Started'));

    screen.getByText('Pick a skill to practice');
    screen.getByRole('button', {name: 'Ideate'});
    screen.getByRole('button', {name: 'Create'});
  });

  test('selecting an option and clicking "Continue" transitions to practice page', () => {
    render(<AiDiffWelcome {...DEFAULT_PROPS} firstState={'select_option'} />);

    fireEvent.click(screen.getByRole('button', {name: 'Ideate'}));

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    screen.getByText('ai chat mocked');
  });

  test('practice page buttons work correctly', async () => {
    render(<AiDiffWelcome {...DEFAULT_PROPS} firstState={'practice'} />);

    expect(screen.getByRole('button', {name: 'Continue'})).toBeDisabled();

    // Click a button that simulates getting a chat response
    fireEvent.click(screen.getByText('ai chat mocked'));

    expect(screen.getByRole('button', {name: 'Continue'})).toBeEnabled();
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    screen.getByText('You’re on your way to becoming an AI all-star!');
  });

  test('clicking "Finish" on the end page triggers setShowWelcomeExperience', async () => {
    const setShowWelcomeExperienceStub = jest.fn();
    render(
      <AiDiffWelcome
        {...DEFAULT_PROPS}
        setShowWelcomeExperience={setShowWelcomeExperienceStub}
        firstState={'end_page'}
      />
    );
    screen.getByText('You’re on your way to becoming an AI all-star!');

    screen.getByText('Continue your learning journey');

    fireEvent.click(screen.getByRole('button', {name: 'Finish'}));

    screen.getByText('confetti');

    await waitFor(
      () => expect(setShowWelcomeExperienceStub).toHaveBeenCalledWith(false),
      {timeout: 100}
    );
  }, 15000);

  test('End page buttons work correctly', async () => {
    render(<AiDiffWelcome {...DEFAULT_PROPS} firstState={'end_page'} />);

    screen.getByText('confetti');

    expect(
      screen.getByRole('link', {
        name: 'Take Code.org’s self-paced AI 101 professional learning course',
      })
    ).toHaveAttribute('href', 'https://code.org/ai/pl/101');

    fireEvent.click(
      screen.getByRole('button', {name: 'Practice another skill'})
    );
    screen.getByText('Pick a skill to practice');
  });

  test('Back button works correctly', () => {
    render(<AiDiffWelcome {...DEFAULT_PROPS} firstState={'select_option'} />);

    fireEvent.click(screen.getByRole('button', {name: 'Back'}));
    screen.getByText('AI Teaching Assistant');

    screen.getByText('Empowering teachers. Enhancing learning.');
  });

  test('Skip tutorial works correctly', async () => {
    const setShowWelcomeExperienceStub = jest.fn();
    render(
      <AiDiffWelcome
        {...DEFAULT_PROPS}
        setShowWelcomeExperience={setShowWelcomeExperienceStub}
        firstState={'select_option'}
      />
    );

    fireEvent.click(screen.getByRole('link', {name: 'Skip the tutorial'}));

    await waitFor(
      () => expect(setShowWelcomeExperienceStub).toHaveBeenCalledWith(false),
      {timeout: 100}
    );
  });
});
