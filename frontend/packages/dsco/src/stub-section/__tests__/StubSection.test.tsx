/**
 * These tests were generated via Copilot for scaffolding and should be removed when actual components are implemented.
 */
import {render} from '@testing-library/react';
import {StubSection} from '../StubSection';

describe('StubSection', () => {
  it('renders with the correct label', () => {
    const {getByText} = render(
      <StubSection backgroundColor="black" label="Test Label" />,
    );
    expect(getByText('Test Label')).toBeInTheDocument();
  });

  it('applies the correct background color', () => {
    const {container} = render(
      <StubSection backgroundColor="red" label="Test Label" />,
    );
    expect(container.firstChild).toHaveStyle('background-color: red');
  });

  it('renders with white background color', () => {
    const {container} = render(
      <StubSection backgroundColor="white" label="White Background" />,
    );
    expect(container.firstChild).toHaveStyle('background-color: white');
  });

  it('renders with black background color', () => {
    const {container} = render(
      <StubSection backgroundColor="black" label="Black Background" />,
    );
    expect(container.firstChild).toHaveStyle('background-color: black');
  });
});
