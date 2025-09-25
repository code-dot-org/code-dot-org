import {render, screen} from '@testing-library/react';
import {useParams} from 'next/navigation';

import ContentEditorTools from '../Tools';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  redirect: jest.fn(),
}));

describe('ContentEditorTools', () => {
  const originalLocation = window.location;

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {reload: jest.fn(), origin: originalLocation.origin},
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({
      paths: ['engineering', 'test-slug'],
      locale: 'en',
    });
  });

  it('renders the preview label', () => {
    render(
      <ContentEditorTools
        isDraftModeEnabled={false}
        previewLabel="Preview Mode"
      />,
    );

    expect(
      screen.getByText('Viewing Preview Mode (Published)'),
    ).toBeInTheDocument();
  });

  it('renders "Draft Mode" text when draft mode is enabled', () => {
    render(
      <ContentEditorTools
        isDraftModeEnabled={true}
        previewLabel="Preview Mode"
      />,
    );

    expect(
      screen.getByText('Viewing Preview Mode (Draft)'),
    ).toBeInTheDocument();
  });
});
