import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import VideoChallenge from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/VideoChallenge';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {post: jest.fn(), put: jest.fn()},
}));

// VideoRecorder relies on MediaRecorder and getUserMedia, unavailable in jsdom.
// The stub exposes two buttons mirroring the real recorder's state machine:
// - "Start Recording" signals recording-in-progress via onIsRecordingChange(true)
// - "Stop Recording" fires the same sequence as recorder.onstop: setRecordedUrl,
//   onRecordingChange(true), onIsRecordingChange(false)
jest.mock('@code-dot-org/lesson-deep-dive', () => {
  const React = require('react');
  return {
    ...jest.requireActual('@code-dot-org/lesson-deep-dive'),
    VideoRecorder: (props: {
      onRecordingChange: (hasRecording: boolean) => void;
      onIsRecordingChange?: (isRecording: boolean) => void;
      setRecordedUrl: (url: string | null) => void;
      disabled?: boolean;
    }) =>
      React.createElement(
        'div',
        null,
        React.createElement(
          'button',
          {
            type: 'button',
            disabled: props.disabled,
            onClick: () => props.onIsRecordingChange?.(true),
          },
          'Start Recording'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            disabled: props.disabled,
            onClick: () => {
              props.setRecordedUrl('blob:fake-recording');
              props.onRecordingChange(true);
              props.onIsRecordingChange?.(false);
            },
          },
          'Stop Recording'
        )
      ),
  };
});

const post = HttpClient.post as jest.Mock;
const put = HttpClient.put as jest.Mock;

const fakeBlob = new Blob(['video-bytes'], {type: 'video/webm'});
const createdResponse = {
  id: 7,
  challenge_id: 5,
  user_id: 1,
  student_text: null,
  transcript: null,
  student_feedback: null,
  evaluation_result: null,
  is_final: true,
  evaluated_at: null,
  created_at: '2024-01-01',
  assets: [{id: 9, asset_type: 'video', upload_url: ''}],
};

const fakeChallenge = {
  id: 5,
  lesson_id: 1,
  question: 'Explain your solution.',
  default_modality: 'video' as const,
  whiteboard_starter_image_alt_text: null,
};

// Helper: simulate the full record → stop sequence.
const recordVideo = () => {
  fireEvent.click(screen.getByRole('button', {name: 'Start Recording'}));
  fireEvent.click(screen.getByRole('button', {name: 'Stop Recording'}));
};

describe('VideoChallenge', () => {
  let originalFetch: typeof globalThis.fetch | undefined;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    post.mockReset();
    put.mockReset();
    originalFetch = (globalThis as {fetch?: typeof originalFetch}).fetch;
    fetchMock = jest.fn().mockResolvedValue({blob: async () => fakeBlob});
    (globalThis as unknown as {fetch?: jest.Mock}).fetch = fetchMock;
  });

  afterEach(() => {
    (globalThis as {fetch?: typeof originalFetch}).fetch = originalFetch;
  });

  it('disables submit until a video is recorded', () => {
    render(
      <VideoChallenge
        challenge={fakeChallenge}
        submitted={false}
        submitCallback={jest.fn()}
      />
    );

    expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();

    recordVideo();
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });

  it('disables submit while recording is in progress', () => {
    render(
      <VideoChallenge
        challenge={fakeChallenge}
        submitted={false}
        submitCallback={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Start Recording'}));
    expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();

    fireEvent.click(screen.getByRole('button', {name: 'Stop Recording'}));
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });

  it('fetches the video blob, creates a response, and uploads the video', async () => {
    post.mockResolvedValue({json: async () => createdResponse});
    put.mockResolvedValue({});
    const submitCallback = jest.fn();

    render(
      <VideoChallenge
        challenge={fakeChallenge}
        submitted={false}
        submitCallback={submitCallback}
      />
    );

    recordVideo();
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() => expect(submitCallback).toHaveBeenCalledWith(true));

    expect(fetchMock).toHaveBeenCalledWith('blob:fake-recording');
    expect(post).toHaveBeenCalledWith(
      '/challenge_responses',
      JSON.stringify({
        challenge_id: 5,
        is_final: true,
        assets: [{asset_type: 'video'}],
      }),
      true,
      {'Content-Type': 'application/json'}
    );
    expect(put).toHaveBeenCalledWith(
      '/challenge_response_assets/9/upload',
      fakeBlob,
      true,
      {'Content-Type': 'video/webm'}
    );
  });

  it('disables submit while upload is in progress', async () => {
    let resolvePost!: (value: unknown) => void;
    post.mockReturnValue(
      new Promise(resolve => {
        resolvePost = resolve;
      })
    );
    put.mockResolvedValue({});

    render(
      <VideoChallenge
        challenge={fakeChallenge}
        submitted={false}
        submitCallback={jest.fn()}
      />
    );

    recordVideo();
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled()
    );

    // Unblock the upload so the component settles cleanly.
    resolvePost({json: async () => createdResponse});
    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled()
    );
  });

  it('re-enables submit after an upload error so the user can retry', async () => {
    post.mockRejectedValue(new Error('Network error'));
    const submitCallback = jest.fn();

    render(
      <VideoChallenge
        challenge={fakeChallenge}
        submitted={false}
        submitCallback={submitCallback}
      />
    );

    recordVideo();
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled()
    );
  });
});
