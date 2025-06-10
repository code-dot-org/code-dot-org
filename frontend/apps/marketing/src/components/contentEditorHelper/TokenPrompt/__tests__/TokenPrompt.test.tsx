import {render, screen, fireEvent} from '@testing-library/react';

import TokenPrompt, {TokenPromptProps} from '../TokenPrompt';

describe('TokenPrompt', () => {
  const mockOnSubmit = jest.fn();

  const renderComponent = (props: Partial<TokenPromptProps> = {}) => {
    return render(<TokenPrompt onSubmit={mockOnSubmit} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the TextField and Button components', () => {
    renderComponent();

    expect(screen.getByLabelText('Draft Token')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Submit'})).toBeInTheDocument();
  });

  it('updates the token state when input changes', () => {
    renderComponent();

    const input = screen.getByLabelText('Draft Token') as HTMLInputElement;
    fireEvent.change(input, {target: {value: 'test-token'}});

    expect(input.value).toBe('test-token');
  });

  it('calls onSubmit with the token when the button is clicked', () => {
    renderComponent();

    const input = screen.getByLabelText('Draft Token') as HTMLInputElement;
    fireEvent.change(input, {target: {value: 'test-token'}});

    const button = screen.getByRole('button', {name: 'Submit'});
    fireEvent.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith('test-token');
  });

  it('calls onSubmit with null if no token is entered', () => {
    renderComponent();

    const button = screen.getByRole('button', {name: 'Submit'});
    fireEvent.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith(null);
  });
});
