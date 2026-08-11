import '@testing-library/jest-dom';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import {
  FLAGGED_IMAGE_URL_MESSAGE,
  IMAGE_MODERATION_ERROR_MESSAGE,
} from '@cdo/apps/applab/constants';
import {clearImageUrlModerationCache} from '@cdo/apps/applab/imageUrlModeration';
import ImageURLInput from '@cdo/apps/code-studio/components/ImageURLInput';
import {moderateImageUrl} from '@cdo/apps/util/moderateImage';

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {
    sendEvent: jest.fn(),
  },
}));

jest.mock('@cdo/apps/util/moderateImage', () => ({
  moderateImageUrl: jest.fn(),
}));

describe('ImageURLInput', () => {
  const mockModerateImageUrl = moderateImageUrl as jest.MockedFunction<
    typeof moderateImageUrl
  >;
  let assetChosen: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    clearImageUrlModerationCache();
    mockModerateImageUrl.mockResolvedValue('safe');
    assetChosen = jest.fn();
  });

  it('submits a safe URL and normalizes http to https', async () => {
    render(<ImageURLInput assetChosen={assetChosen} />);
    fireEvent.change(screen.getByRole('textbox', {name: /image url/i}), {
      target: {value: 'http://example.com/image.png'},
    });
    fireEvent.click(screen.getByRole('button', {name: /submit/i}));

    await waitFor(() =>
      expect(mockModerateImageUrl).toHaveBeenCalledWith(
        'https://example.com/image.png',
        'applab',
        {
          uploaderType: 'ImageURLInput',
          assetUrl: 'https://example.com/image.png',
        }
      )
    );
    expect(assetChosen).toHaveBeenCalledTimes(1);
    expect(assetChosen.mock.calls[0][0]).toBe('https://example.com/image.png');
  });

  it('shows invalid URL error and does not moderate', async () => {
    render(<ImageURLInput assetChosen={assetChosen} />);
    fireEvent.change(screen.getByRole('textbox', {name: /image url/i}), {
      target: {value: 'not-a-url'},
    });
    fireEvent.click(screen.getByRole('button', {name: /submit/i}));

    await waitFor(() =>
      expect(
        screen.getByText('Please provide a valid URL.')
      ).toBeInTheDocument()
    );
    expect(mockModerateImageUrl).not.toHaveBeenCalled();
    expect(assetChosen).not.toHaveBeenCalled();
  });

  it('hard-blocks a flagged URL', async () => {
    mockModerateImageUrl.mockResolvedValue('flagged');
    render(<ImageURLInput assetChosen={assetChosen} />);
    fireEvent.change(screen.getByRole('textbox', {name: /image url/i}), {
      target: {value: 'https://example.com/flagged.png'},
    });
    fireEvent.click(screen.getByRole('button', {name: /submit/i}));

    await waitFor(() =>
      expect(screen.getByText(FLAGGED_IMAGE_URL_MESSAGE)).toBeInTheDocument()
    );
    expect(assetChosen).not.toHaveBeenCalled();
  });

  it('shows moderation error when moderation is unavailable', async () => {
    mockModerateImageUrl.mockResolvedValue('error');
    render(<ImageURLInput assetChosen={assetChosen} />);
    fireEvent.change(screen.getByRole('textbox', {name: /image url/i}), {
      target: {value: 'https://example.com/image.png'},
    });
    fireEvent.click(screen.getByRole('button', {name: /submit/i}));

    await waitFor(() =>
      expect(
        screen.getByText(IMAGE_MODERATION_ERROR_MESSAGE)
      ).toBeInTheDocument()
    );
    expect(assetChosen).not.toHaveBeenCalled();
  });
});
