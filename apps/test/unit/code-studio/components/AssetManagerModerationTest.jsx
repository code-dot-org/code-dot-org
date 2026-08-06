import '@testing-library/jest-dom';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import AssetManager from '@cdo/apps/code-studio/components/AssetManager';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';
import {moderateImage} from '@cdo/apps/util/moderateImage';

const mockSubmit = jest.fn();

jest.mock('@cdo/apps/util/moderateImage', () => ({
  moderateImage: jest.fn(),
}));

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn(),
}));

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {
    sendEvent: jest.fn(),
  },
}));

jest.mock('@cdo/apps/metrics/MetricsReporter', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
  },
}));

jest.mock('@cdo/apps/clientApi', () => {
  const makeApi = () => ({
    getProjectId: () => 'channel-1',
    getProjectType: () => 'applab',
    getUploadUrl: () => '/v3/assets/channel-1/',
    getFiles: success => success({files: []}),
    withProjectId() {
      return this;
    },
    wrapUploadDoneCallback: callback => callback,
    wrapUploadStartCallback: callback => callback,
  });
  const api = makeApi();
  return {
    assets: api,
    files: api,
    starterAssets: {
      getStarterAssets: (_levelName, success) =>
        success({response: JSON.stringify({starter_assets: []})}),
      withLevelName: () => api,
    },
  };
});

// jquery.fileupload is awkward to drive in RTL; replace with a plain file input
// that forwards the same {files, submit} shape AssetManager expects.
jest.mock('@cdo/apps/code-studio/components/HiddenUploader', () => {
  const React = require('react');
  const PropTypes = require('prop-types');
  const MockHiddenUploader = React.forwardRef(function MockHiddenUploader(
    {onUploadStart},
    ref
  ) {
    React.useImperativeHandle(ref, () => ({
      openFileChooser: jest.fn(),
    }));
    return (
      <input
        type="file"
        className="uitest-hidden-uploader"
        onChange={event => {
          const file = event.target.files?.[0];
          if (!file) {
            return;
          }
          onUploadStart({files: [file], submit: mockSubmit});
        }}
      />
    );
  });
  MockHiddenUploader.propTypes = {
    onUploadStart: PropTypes.func,
  };
  return {
    __esModule: true,
    default: MockHiddenUploader,
  };
});

const DEFAULT_PROPS = {
  uploadsEnabled: true,
  projectId: 'channel-1',
};

function makeImageFile(name = 'test.png', type = 'image/png') {
  return new File(['x'], name, {type});
}

async function uploadFile(user, file) {
  const input = await waitFor(() => {
    const el = document.querySelector('.uitest-hidden-uploader');
    expect(el).not.toBeNull();
    return el;
  });
  await user.upload(input, file);
}

describe('AssetManager image moderation', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    mockSubmit.mockClear();
    moderateImage.mockResolvedValue('safe');
    HttpClient.post.mockResolvedValue({
      json: () => Promise.resolve({}),
    });
  });

  it('submits without moderating non-image files', async () => {
    render(<AssetManager {...DEFAULT_PROPS} />);
    await uploadFile(user, makeImageFile('sound.mp3', 'audio/mpeg'));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
    expect(moderateImage).not.toHaveBeenCalled();
  });

  it('submits without moderating in start mode', async () => {
    render(<AssetManager {...DEFAULT_PROPS} isStartMode levelName="level-1" />);
    await uploadFile(user, makeImageFile());

    await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
    expect(moderateImage).not.toHaveBeenCalled();
  });

  it('moderates then submits a safe image', async () => {
    render(<AssetManager {...DEFAULT_PROPS} />);
    const file = makeImageFile();
    await uploadFile(user, file);

    await waitFor(() =>
      expect(moderateImage).toHaveBeenCalledWith(
        file,
        'applab',
        expect.objectContaining({uploaderType: 'AssetManager'})
      )
    );
    expect(mockSubmit).toHaveBeenCalled();
    expect(
      screen.queryByText('Warning: Inappropriate Image')
    ).not.toBeInTheDocument();
  });

  it('submits when moderation returns error', async () => {
    moderateImage.mockResolvedValue('error');
    render(<AssetManager {...DEFAULT_PROPS} />);
    await uploadFile(user, makeImageFile());

    await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
    expect(
      screen.queryByText('Warning: Inappropriate Image')
    ).not.toBeInTheDocument();
  });

  it('shows flagged modal and does not submit when flagged', async () => {
    moderateImage.mockResolvedValue('flagged');
    render(<AssetManager {...DEFAULT_PROPS} />);
    await uploadFile(user, makeImageFile());

    expect(
      await screen.findByText('Warning: Inappropriate Image')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This image has been flagged as inappropriate/i)
    ).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('accepts flagged image: flags channel, submits, disables uploads', async () => {
    moderateImage.mockResolvedValue('flagged');
    render(<AssetManager {...DEFAULT_PROPS} />);
    await uploadFile(user, makeImageFile());

    expect(
      await screen.findByText('Warning: Inappropriate Image')
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: /^accept$/i}));

    await waitFor(() =>
      expect(HttpClient.post).toHaveBeenCalledWith(
        '/v3/channels/channel-1/abuse/image',
        JSON.stringify({type: 'flag'}),
        true,
        {'Content-Type': 'application/json; charset=UTF-8'}
      )
    );
    expect(mockSubmit).toHaveBeenCalled();
    expect(
      screen.queryByText('Warning: Inappropriate Image')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: /upload file/i})).toBeDisabled();
    expect(analyticsReporter.sendEvent).toHaveBeenCalledWith(
      EVENTS.ACCEPT_FLAGGED_CUSTOM_IMAGE,
      {
        UploaderType: 'AssetManager',
        ProjectType: 'applab',
      }
    );
  });

  it('cancels flagged image without submitting', async () => {
    moderateImage.mockResolvedValue('flagged');
    render(<AssetManager {...DEFAULT_PROPS} />);
    await uploadFile(user, makeImageFile());

    expect(
      await screen.findByText('Warning: Inappropriate Image')
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: /^cancel$/i}));

    await waitFor(() =>
      expect(
        screen.queryByText('Warning: Inappropriate Image')
      ).not.toBeInTheDocument()
    );
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(HttpClient.post).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: /upload file/i})).toBeEnabled();
    expect(analyticsReporter.sendEvent).toHaveBeenCalledWith(
      EVENTS.CANCEL_FLAGGED_CUSTOM_IMAGE,
      {
        UploaderType: 'AssetManager',
        ProjectType: 'applab',
      }
    );
  });

  it('keeps modal open when abuse flag request fails', async () => {
    moderateImage.mockResolvedValue('flagged');
    HttpClient.post.mockRejectedValue(new Error('network'));
    render(<AssetManager {...DEFAULT_PROPS} />);
    await uploadFile(user, makeImageFile());

    expect(
      await screen.findByText('Warning: Inappropriate Image')
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: /^accept$/i}));

    await waitFor(() =>
      expect(screen.getByRole('button', {name: /^accept$/i})).toBeDisabled()
    );
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText('Warning: Inappropriate Image')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /upload file/i})).toBeEnabled();
  });
});
