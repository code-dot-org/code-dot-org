import {render} from '@testing-library/react';

import ActionBlock, {ActionBlockContentfulProps} from '../ActionBlock';

describe('ActionBlock', () => {
  const defaultProps: ActionBlockContentfulProps = {
    overline: 'Test Overline',
    title: 'Test Title',
    description: 'Test Description',
    image: {
      fields: {
        file: {url: 'https://code.org/image.jpg'},
      },
    },
    primaryButton: {
      fields: {
        label: 'Test Primary Button',
        primaryTarget: '/primary-link',
        ariaLabel: 'Test Primary Button aria label',
      },
    },
    secondaryButton: {
      fields: {
        label: 'Test Secondary Button',
        primaryTarget: '/secondary-link',
        ariaLabel: 'Test Secondary Button aria label',
      },
    },
    background: 'primary',
  };

  it('renders component with all props', () => {
    const {getByText, getByAltText} = render(<ActionBlock {...defaultProps} />);

    expect(getByText('Test Overline')).toBeInTheDocument();
    expect(getByText('Test Title')).toBeInTheDocument();
    expect(getByText('Test Description')).toBeInTheDocument();
    expect(getByAltText('')).toBeInTheDocument();
    expect(getByText('Test Primary Button')).toBeInTheDocument();
    expect(getByText('Test Secondary Button')).toBeInTheDocument();
  });

  it('does not render buttons when the primary button is not provided', () => {
    const {queryByText} = render(
      <ActionBlock {...defaultProps} primaryButton={undefined} />,
    );

    // check for primary button
    expect(queryByText('Test Primary Button')).not.toBeInTheDocument();

    // check for secondary button
    expect(queryByText('Test Secondary Button')).not.toBeInTheDocument();
  });
});
