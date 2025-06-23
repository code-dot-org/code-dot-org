import {render, screen, fireEvent} from '@testing-library/react';

import ErrorPage from '../Error';

describe('Error Component', () => {
  it('renders 404 error correctly', () => {
    render(<ErrorPage statusCode={404} />);

    expect(screen.getByText("We couldn't find this page")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We couldn't find the page you were looking for, let's get you back on track.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: 'Go to homepage'}),
    ).toBeInTheDocument();
  });

  it('renders 500 error correctly', () => {
    const mockResetAction = jest.fn();
    const mockError = new Error('Test error');
    render(
      <ErrorPage
        statusCode={500}
        error={mockError}
        resetAction={mockResetAction}
      />,
    );

    expect(screen.getByText("This page isn't working")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Uh oh! We ran into an internal server error and couldn't complete your request.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Reload this page'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: 'Check status page'}),
    ).toBeInTheDocument();
  });

  it('calls resetAction when reload button is clicked', () => {
    const mockResetAction = jest.fn();
    const mockError = new Error('Test error');
    render(
      <ErrorPage
        statusCode={500}
        error={mockError}
        resetAction={mockResetAction}
      />,
    );

    const reloadButton = screen.getByRole('button', {name: 'Reload this page'});
    fireEvent.click(reloadButton);

    expect(mockResetAction).toHaveBeenCalledTimes(1);
  });

  it('toggles error stack trace visibility', () => {
    const mockResetAction = jest.fn();
    const mockError = new Error('Test error');
    render(
      <ErrorPage
        statusCode={500}
        error={mockError}
        resetAction={mockResetAction}
      />,
    );

    const toggleButton = screen.getByRole('button', {name: 'Toggle error'});
    fireEvent.click(toggleButton);

    expect(
      screen.getByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'pre' &&
          content.includes(mockError.message)
        );
      }),
    ).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(
      screen.queryByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'pre' &&
          content.includes(mockError.message)
        );
      }),
    ).not.toBeInTheDocument();
  });
});
