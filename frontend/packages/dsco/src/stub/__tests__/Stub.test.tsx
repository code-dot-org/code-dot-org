/**
 * These tests were generated via Copilot for scaffolding and should be removed when actual components are implemented.
 */
import {render, screen, fireEvent} from '@testing-library/react';
import {Stub} from '../';

describe('Stub Component', () => {
  test('renders with correct label', () => {
    render(<Stub backgroundColor="black" label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  test('applies correct background color', () => {
    render(<Stub backgroundColor="red" label="Test Label" />);
    expect(screen.getByText('Test Label')).toHaveStyle({
      backgroundColor: 'red',
    });
  });

  test('calls onClick when button is clicked', () => {
    const handleClick = jest.fn();
    render(
      <Stub backgroundColor="black" label="Click Me" onClick={handleClick} />,
    );
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not throw error if onClick is not provided', () => {
    render(<Stub backgroundColor="black" label="No Click Handler" />);
    fireEvent.click(screen.getByText('No Click Handler'));
    expect(screen.getByText('No Click Handler')).toBeInTheDocument();
  });
});
