import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import QuizFooter from '@cdo/apps/quiz/attempt/QuizFooter';

describe('QuizFooter', () => {
  it('hides the Back button on the first page', () => {
    render(
      <QuizFooter
        currentPageNumber={1}
        totalPages={3}
        onNavigateToPage={jest.fn()}
        onNext={jest.fn()}
        finishButtonLabel="Finish"
      />
    );

    expect(
      screen.queryByRole('button', {name: /Back/})
    ).not.toBeInTheDocument();
  });

  it('shows a Back button on a later page, and navigates to the previous page on click', () => {
    const onNavigateToPage = jest.fn();
    render(
      <QuizFooter
        currentPageNumber={2}
        totalPages={3}
        onNavigateToPage={onNavigateToPage}
        onNext={jest.fn()}
        finishButtonLabel="Finish"
      />
    );

    fireEvent.click(screen.getByRole('button', {name: /Back/}));

    expect(onNavigateToPage).toHaveBeenCalledWith(1);
  });

  it('hides pagination for a single-page quiz', () => {
    render(
      <QuizFooter
        currentPageNumber={1}
        totalPages={1}
        onNavigateToPage={jest.fn()}
        onNext={jest.fn()}
        finishButtonLabel="Finish"
      />
    );

    expect(
      screen.queryByRole('button', {name: 'Go to page 1'})
    ).not.toBeInTheDocument();
  });

  it('shows one pagination button per page for a multi-page quiz, and navigates on click', () => {
    const onNavigateToPage = jest.fn();
    render(
      <QuizFooter
        currentPageNumber={1}
        totalPages={3}
        onNavigateToPage={onNavigateToPage}
        onNext={jest.fn()}
        finishButtonLabel="Finish"
      />
    );

    expect(
      screen.getByRole('button', {name: 'Go to page 1', pressed: true})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Go to page 2', pressed: false})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Go to page 3', pressed: false})
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Go to page 3'}));

    expect(onNavigateToPage).toHaveBeenCalledWith(3);
  });

  it('shows Next, not finishButtonLabel, before the last page', () => {
    render(
      <QuizFooter
        currentPageNumber={1}
        totalPages={2}
        onNavigateToPage={jest.fn()}
        onNext={jest.fn()}
        finishButtonLabel="Submit"
      />
    );

    expect(screen.getByRole('button', {name: /Next/})).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Submit'})
    ).not.toBeInTheDocument();
  });

  it('shows finishButtonLabel on the last page, and calls onNext on click', () => {
    const onNext = jest.fn();
    render(
      <QuizFooter
        currentPageNumber={2}
        totalPages={2}
        onNavigateToPage={jest.fn()}
        onNext={onNext}
        finishButtonLabel="Finish"
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Finish'}));

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('renders whatever finishButtonLabel it is given, e.g. Submit for a single-attempt quiz', () => {
    render(
      <QuizFooter
        currentPageNumber={1}
        totalPages={1}
        onNavigateToPage={jest.fn()}
        onNext={jest.fn()}
        finishButtonLabel="Submit"
      />
    );

    expect(screen.getByRole('button', {name: 'Submit'})).toBeInTheDocument();
  });
});
