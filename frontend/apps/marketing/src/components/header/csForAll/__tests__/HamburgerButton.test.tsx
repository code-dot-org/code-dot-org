import {render, screen, fireEvent} from '@testing-library/react';

import HamburgerButton from '../HamburgerButton';

describe('HamburgerButton', () => {
  const onClickMock = jest.fn();

  beforeEach(() => {
    onClickMock.mockClear();
  });

  it('renders the IconButton with correct aria-label', () => {
    render(<HamburgerButton onClick={onClickMock} />);
    const button = screen.getByLabelText(/open menu/i);
    expect(button).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<HamburgerButton onClick={onClickMock} />);
    const button = screen.getByLabelText(/open menu/i);
    fireEvent.click(button);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
