import {render, screen, fireEvent} from '@testing-library/react';

import CloseButton from '../CloseButton';

describe('CloseButton', () => {
  const onClickMock = jest.fn();

  beforeEach(() => {
    onClickMock.mockClear();
  });

  it('renders the CloseButton with correct aria-label', () => {
    render(<CloseButton onClick={onClickMock} />);
    const button = screen.getByLabelText(/close menu/i);
    expect(button).toBeInTheDocument();
  });

  it('calls onClick when the button is clicked', () => {
    render(<CloseButton onClick={onClickMock} />);
    const button = screen.getByLabelText(/close menu/i);
    fireEvent.click(button);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
