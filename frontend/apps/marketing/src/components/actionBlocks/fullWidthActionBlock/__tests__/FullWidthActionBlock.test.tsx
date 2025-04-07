import {render} from '@testing-library/react';

import FullWidthActionBlock, {
  FullWidthActionBlockContentfulProps,
} from '../FullWidthActionBlock';

describe('ActionBlock', () => {
  const defaultProps: FullWidthActionBlockContentfulProps = {
    image: {
      fields: {
        file: {url: 'https://code.org/image.jpg'},
      },
    },
    overline: 'Test Overline',
    title: 'Test Title',
    description: 'Test Description',
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
    const {getByText, getByAltText} = render(
      <FullWidthActionBlock {...defaultProps} />,
    );

    expect(getByText('Test Overline')).toBeInTheDocument();
    expect(getByText('Test Title')).toBeInTheDocument();
    expect(getByText('Test Description')).toBeInTheDocument();
    expect(getByAltText('')).toBeInTheDocument();
    expect(getByText('Test Primary Button')).toBeInTheDocument();
    expect(getByText('Test Secondary Button')).toBeInTheDocument();
  });

  it('does not render buttons when the primary button is not provided', () => {
    const {queryByText} = render(
      <FullWidthActionBlock {...defaultProps} primaryButton={undefined} />,
    );

    // check for primary button
    expect(queryByText('Test Primary Button')).not.toBeInTheDocument();

    // check for secondary button
    expect(queryByText('Test Secondary Button')).not.toBeInTheDocument();
  });

  it('renders external link icon for buttons when isThisAnExternalLink is true', () => {
    const {queryAllByTestId} = render(
      <FullWidthActionBlock
        {...defaultProps}
        primaryButton={{
          fields: {
            ...defaultProps.primaryButton.fields,
            isThisAnExternalLink: true,
          },
        }}
        secondaryButton={{
          fields: {
            ...defaultProps.primaryButton.fields,
            isThisAnExternalLink: true,
          },
        }}
      />,
    );

    expect(queryAllByTestId('font-awesome-v6-icon')).toHaveLength(2);
  });
});
