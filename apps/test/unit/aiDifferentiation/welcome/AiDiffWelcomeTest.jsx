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

const DEFAULT_PROPS = {
  setShowWelcomeExperience: () => {},
  context: 'some-context',
  scriptId: 1,
  scriptName: 'Test Script',
  unitDisplayName: 'Unit 1',
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
    screen.getByRole('button', {name: 'Plan'});
    screen.getByRole('button', {name: 'Create'});
  });

  test('selecting an option and clicking "Continue" transitions to practice page', () => {
    render(<AiDiffWelcome {...DEFAULT_PROPS} />);

    fireEvent.click(screen.getByRole('button', {name: 'Get Started'}));

    fireEvent.click(screen.getByRole('button', {name: 'Plan'}));

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    screen.getByText(
      'Lets iterate together! What would you like to change? Below are some of the tasks I can help you with.'
    );
  });

  test('clicking "Finish" on the end page triggers setShowWelcomeExperience', async () => {
    const setShowWelcomeExperienceStub = jest.fn();
    render(
      <AiDiffWelcome
        {...DEFAULT_PROPS}
        setShowWelcomeExperience={setShowWelcomeExperienceStub}
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Get Started'}));
    fireEvent.click(screen.getByRole('button', {name: 'Plan'}));
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    expect(screen.getByRole('button', {name: 'Continue'})).toBeDisabled();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: 'Test'}});
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(
      () =>
        expect(screen.getByRole('button', {name: 'Continue'})).toBeEnabled(),
      {timeout: 100}
    );
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    screen.getByText('You’re on your way to becoming an AI all-star!');

    screen.getByText('Continue your learning journey');

    fireEvent.click(screen.getByRole('button', {name: 'Finish'}));

    await waitFor(
      () => expect(setShowWelcomeExperienceStub).toHaveBeenCalledWith(false),
      {timeout: 100}
    );
    return;
  }, 15000);

  test('End page buttons work correctly', async () => {
    render(<AiDiffWelcome {...DEFAULT_PROPS} />);

    fireEvent.click(screen.getByRole('button', {name: 'Get Started'}));
    fireEvent.click(screen.getByRole('button', {name: 'Plan'}));
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    expect(screen.getByRole('button', {name: 'Continue'})).toBeDisabled();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: 'Test'}});
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'Continue'})).toBeEnabled()
    );
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    expect(
      screen.getByRole('link', {
        name: 'Take Code.org’s self-paced AI 101 professional learning course',
      })
    ).toHaveAttribute('href', 'https://code.org/ai/pl/101');

    fireEvent.click(
      screen.getByRole('button', {name: 'Practice another skill'})
    );
    screen.getByText('Pick a skill to practice');
    return;
  }, 15000);

  test('Back button works correctly', () => {
    render(<AiDiffWelcome {...DEFAULT_PROPS} />);

    fireEvent.click(screen.getByRole('button', {name: 'Get Started'}));

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
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Get Started'}));

    fireEvent.click(screen.getByRole('link', {name: 'Skip the tutorial'}));

    await waitFor(() =>
      expect(setShowWelcomeExperienceStub).toHaveBeenCalledWith(false)
    );
  }, 15000);
});
