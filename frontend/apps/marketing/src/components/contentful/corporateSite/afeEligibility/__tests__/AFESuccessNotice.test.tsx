import {render, screen, fireEvent} from '@testing-library/react';

import AFESuccessNotice from '../AFESuccessNotice';

describe('AFESuccessNotice', () => {
  const onCloseMock = jest.fn();

  const renderComponent = () =>
    render(<AFESuccessNotice onClose={onCloseMock} />);

  beforeEach(() => {
    onCloseMock.mockClear();
  });

  it('renders the success message and UI elements', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', {
        name: /Congratulations! You successfully signed up/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You should receive an email/i),
    ).toBeInTheDocument();

    const link = screen.getByRole('link', {
      name: 'Start teaching with Code.org',
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/teach');
  });

  it('calls onClose when the dialog is dismissed', () => {
    renderComponent();

    // Assuming CustomDialog renders a button to close
    const closeButton = screen.getByRole('button', {name: /close/i});
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
