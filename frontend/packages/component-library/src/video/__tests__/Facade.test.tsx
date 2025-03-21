import {render, screen} from '@testing-library/react';

import Facade from '../Facade';

describe('Facade Component', () => {
  it('renders the component correctly', () => {
    const {container} = render(<Facade alt={'Facade'} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('displays poster that is lazily loaded', () => {
    render(<Facade alt={'Facade'} posterThumbnail="mock.png" />);
    const poster = screen.getByAltText('Facade');
    expect(poster).toHaveAttribute('loading', 'lazy');
    expect(poster).toBeVisible();
  });
});
