import Paragraph from '@/components/paragraph';
import {render, screen} from '@testing-library/react';

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
