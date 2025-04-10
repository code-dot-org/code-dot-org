import {render} from '@testing-library/react';

import {LinkEntry} from '@/types/contentful/entries/Link';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

import FullWidthActionBlock, {
  FullWidthActionBlockContentfulProps,
} from '../FullWidthActionBlock';

describe('ActionBlock', () => {
  const defaultProps: FullWidthActionBlockContentfulProps = {
    image: {
      fields: {
        file: {url: 'https://code.org/image.jpg'},
      },
    } as ExperienceAsset,
    overline: 'Test Overline',
    title: 'Test Title',
    description: 'Test Description',
    primaryButton: {
      fields: {
        label: 'Test Primary Button',
        primaryTarget: '/primary-link',
        ariaLabel: 'Test Primary Button aria label',
        isThisAnExternalLink: false,
      },
    } as LinkEntry,
    secondaryButton: {
      fields: {
        label: 'Test Secondary Button',
        primaryTarget: '/secondary-link',
        ariaLabel: 'Test Secondary Button aria label',
        isThisAnExternalLink: false,
      },
    } as LinkEntry,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const primaryButton: any = undefined;

    const {queryByText} = render(
      <FullWidthActionBlock {...defaultProps} primaryButton={primaryButton} />,
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
