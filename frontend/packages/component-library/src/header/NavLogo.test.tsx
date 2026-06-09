import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import NavLogo from './NavLogo';

describe('NavLogo', () => {
  it('names the home link via the button and leaves the image decorative', () => {
    const {container} = render(
      <NavLogo logoImageUrl="/logo.svg" brandName="CodeAI" />,
    );
    expect(screen.getByRole('link', {name: 'CodeAI Home'})).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    // alt="" keeps the image out of the accessibility tree (no duplicate announce).
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
