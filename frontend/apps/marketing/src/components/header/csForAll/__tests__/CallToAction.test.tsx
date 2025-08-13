import {render} from '@testing-library/react';

import CallToAction, {CallToActionProps} from '../CallToAction';

describe('CallToAction', () => {
  const defaultProps: CallToActionProps = {
    type: 'emphasized',
    size: 'small',
    text: 'Call to Action',
    href: '/test',
  };

  it('renders with default props', () => {
    const {getByText} = render(<CallToAction {...defaultProps} />);
    const button = getByText('Call to Action');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', '/test');
  });
});
