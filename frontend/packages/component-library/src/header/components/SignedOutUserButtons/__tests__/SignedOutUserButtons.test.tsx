import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import SignedOutUserButtons from '../SignedOutUserButtons';

describe('SignedOutUserButtons', () => {
  it('renders Sign In link', () => {
    render(<SignedOutUserButtons />);
    const link = screen.getByRole('link', {name: 'Sign in'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/users/sign_in');
  });

  it('renders Create Account link', () => {
    render(<SignedOutUserButtons />);
    const link = screen.getByRole('link', {name: 'Create account'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/users/sign_up/account_type');
  });
});
