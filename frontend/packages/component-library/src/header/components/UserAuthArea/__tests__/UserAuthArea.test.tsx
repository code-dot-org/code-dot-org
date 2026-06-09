import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import UserAuthArea from '../UserAuthArea';

describe('UserAuthArea', () => {
  it('announces the loading state', () => {
    render(<UserAuthArea userAuth={{status: 'loading'}} />);
    expect(screen.getByRole('status')).toHaveAccessibleName(
      'Loading your account',
    );
  });

  it('announces the error state', () => {
    render(<UserAuthArea userAuth={{status: 'error'}} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Unable to load your account',
    );
  });
});
