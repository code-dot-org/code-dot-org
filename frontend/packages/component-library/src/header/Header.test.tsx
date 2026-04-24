import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import Header from './Header';

const BASE_PROPS = {
  logoImageUrl: '/logo.png',
  brandName: 'Code.org',
  menuItems: [{label: 'Learn', href: '/students'}],
};

describe('Header', () => {
  it('renders brand and menu items when loading', () => {
    render(<Header {...BASE_PROPS} userAuth={{status: 'loading'}} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
  });

  it('renders Skeleton for loading state', () => {
    const {container} = render(
      <Header {...BASE_PROPS} userAuth={{status: 'loading'}} />,
    );
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('renders Skeleton for error state', () => {
    const {container} = render(
      <Header {...BASE_PROPS} userAuth={{status: 'error'}} />,
    );
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('renders display_name for signed-in state', () => {
    render(
      <Header
        {...BASE_PROPS}
        userAuth={{status: 'signedIn', display_name: 'Alice'}}
      />,
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders Sign In and Create Account links when signed-out', () => {
    render(<Header {...BASE_PROPS} userAuth={{status: 'signedOut'}} />);
    expect(screen.getByRole('link', {name: 'Sign In'})).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: 'Create Account'}),
    ).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('renders brand and menu items in every auth state', () => {
    const states = [
      {status: 'loading' as const},
      {status: 'signedIn' as const, display_name: 'Alice'},
      {status: 'signedOut' as const},
      {status: 'error' as const},
    ];
    for (const userAuth of states) {
      const {unmount} = render(<Header {...BASE_PROPS} userAuth={userAuth} />);
      expect(screen.getByText('Learn')).toBeInTheDocument();
      unmount();
    }
  });
});
