import {render, screen} from '@testing-library/react';

import {Divider} from '../';

describe('Divider Component', () => {
  it('renders Divider component', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  // DividerProps extends HTMLAttributes, so the remaining attributes reach the
  // <hr> rather than being dropped.
  it('forwards other HTML attributes to the hr', () => {
    render(<Divider id="rule" style={{clear: 'both'}} />);
    const divider = screen.getByRole('separator');
    expect(divider).toHaveAttribute('id', 'rule');
    expect(divider).toHaveStyle({clear: 'both'});
  });
});
