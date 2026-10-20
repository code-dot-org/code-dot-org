import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import NextStepPicker from '@cdo/apps/aiTutor/views/lessonDeepDive/NextStepPicker';

describe('NextStepPicker', () => {
  it('renders the heading', () => {
    render(<NextStepPicker onPractice={jest.fn()} onChallenge={jest.fn()} />);
    expect(
      screen.getByRole('heading', {name: /Choose your next step/i})
    ).toBeInTheDocument();
  });

  it('renders the subtext', () => {
    render(<NextStepPicker onPractice={jest.fn()} onChallenge={jest.fn()} />);
    expect(
      screen.getByText(/Think about what you just wrote in your reflection/i)
    ).toBeInTheDocument();
  });

  it('renders both option buttons', () => {
    render(<NextStepPicker onPractice={jest.fn()} onChallenge={jest.fn()} />);
    expect(
      screen.getByRole('button', {name: /I want to practice/i})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /I want a challenge/i})
    ).toBeInTheDocument();
  });

  it('calls onPractice when the practice button is clicked', () => {
    const onPractice = jest.fn();
    render(<NextStepPicker onPractice={onPractice} onChallenge={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', {name: /I want to practice/i}));
    expect(onPractice).toHaveBeenCalledTimes(1);
  });

  it('calls onChallenge when the challenge button is clicked', () => {
    const onChallenge = jest.fn();
    render(<NextStepPicker onPractice={jest.fn()} onChallenge={onChallenge} />);
    fireEvent.click(screen.getByRole('button', {name: /I want a challenge/i}));
    expect(onChallenge).toHaveBeenCalledTimes(1);
  });

  it('does not call onChallenge when the practice button is clicked', () => {
    const onChallenge = jest.fn();
    render(<NextStepPicker onPractice={jest.fn()} onChallenge={onChallenge} />);
    fireEvent.click(screen.getByRole('button', {name: /I want to practice/i}));
    expect(onChallenge).not.toHaveBeenCalled();
  });

  it('does not call onPractice when the challenge button is clicked', () => {
    const onPractice = jest.fn();
    render(<NextStepPicker onPractice={onPractice} onChallenge={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', {name: /I want a challenge/i}));
    expect(onPractice).not.toHaveBeenCalled();
  });
});
