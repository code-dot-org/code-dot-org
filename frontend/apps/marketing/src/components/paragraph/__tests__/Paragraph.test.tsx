import {render, screen} from '@testing-library/react';

import Paragraph from '@/components/paragraph';

describe('Paragraph Component', () => {
  it('should render out the text', async () => {
    render(
      <Paragraph visualAppearance={'body-two'} isStrong={false}>
        Hello World!
      </Paragraph>,
    );

    expect(screen.getByText('Hello World!')).toBeInTheDocument();
  });
});
