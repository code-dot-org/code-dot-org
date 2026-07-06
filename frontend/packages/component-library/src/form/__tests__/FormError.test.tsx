import {render, screen} from '@testing-library/react';

import FormError from '../FormError';

describe('Design System - FormError', () => {
  it('renders nothing without a message', () => {
    const {container} = render(<FormError message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('announces the message as a danger alert', () => {
    render(<FormError message="Email is invalid" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Email is invalid');
    // Rendered via the DSCO Alert as `danger`, which shows the error icon.
    expect(screen.getByTestId('font-awesome-v6-icon').className).toContain(
      'fa-circle-xmark',
    );
  });
});
