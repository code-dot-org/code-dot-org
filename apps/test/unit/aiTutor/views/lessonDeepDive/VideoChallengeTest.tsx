import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {FC, useRef, useState} from 'react';

import VideoChallenge from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/VideoChallenge';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {post: jest.fn(), put: jest.fn()},
}));

const mockTranscribeAudio = jest.fn();

jest.mock('@cdo/apps/aichat/api/client', () => ({
  __esModule: true,
  getClientApi: jest.fn(async () => ({transcribeAudio: mockTranscribeAudio})),
}));

// VideoRecorder relies on MediaRecorder and getUserMedia, unavailable in jsdom.
// The stub exposes two buttons mirroring the real recorder's state machine:
// - "Start Recording" signals recording-in-progress via onIsRecordingChange(true)
// - "Stop Recording" fires the same sequence as the real onstop handlers:
//   setRecordedUrl, setRecordedAudioUrl, onRecordingChange(true),
//   onIsRecordingChange(false)
jest.mock('@code-dot-org/lesson-deep-dive', () => {
  const React = require('react');
  return {
    ...jest.requireActual('@code-dot-org/lesson-deep-dive'),
    VideoRecorder: (props: {
      onRecordingChange: (hasRecording: boolean) => void;
      onIsRecordingChange?: (isRecording: boolean) => void;
      setRecordedUrl: (url: string | null) => void;
      setRecordedAudioUrl: (url: string | null) => void;
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
              props.setRecordedAudioUrl('blob:fake-audio-recording');
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
  is_final: true,
  created_at: '2024-01-01',
  // No download_url: bytes are not uploaded yet at create time.
  assets: [{id: 9, asset_type: 'video'}],
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

// Submit now lives in ChallengeBox's top bar rather than in VideoChallenge.
// This harness plays that role: it holds the submit ref and reflects the
// reported submittability on a stand-in "Submit" button, exactly as the top
// bar does.
const VideoHarness: FC<{
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({submitCallback}) => {
  const submitRef = useRef<(() => void | Promise<void>) | null>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  return (
    <>
      <VideoChallenge
        challenge={fakeChallenge}
        submitted={false}
        submitCallback={submitCallback}
        lessonId={1}
        setEvaluationStatus={jest.fn()}
        setChallengeResponseId={jest.fn()}
        onSubmittableChange={setCanSubmit}
        submitRef={submitRef}
        resetRef={resetRef}
      />
      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => submitRef.current?.()}
      >
        Submit
      </button>
    </>
  );
};

describe('VideoChallenge', () => {
  let originalFetch: typeof globalThis.fetch | undefined;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    post.mockReset();
    put.mockReset();
    mockTranscribeAudio.mockReset();
    mockTranscribeAudio.mockResolvedValue('Hello this is a recording');
    originalFetch = (globalThis as {fetch?: typeof originalFetch}).fetch;
    fetchMock = jest.fn().mockResolvedValue({blob: async () => fakeBlob});
    (globalThis as unknown as {fetch?: jest.Mock}).fetch = fetchMock;
  });

  afterEach(() => {
    (globalThis as {fetch?: typeof originalFetch}).fetch = originalFetch;
  });

  it('disables submit until a video is recorded', () => {
    render(<VideoHarness submitCallback={jest.fn()} />);

    expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();

    recordVideo();
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });

  it('disables submit while recording is in progress', () => {
    render(<VideoHarness submitCallback={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', {name: 'Start Recording'}));
    expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();

    fireEvent.click(screen.getByRole('button', {name: 'Stop Recording'}));
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });

  it('fetches the video blob, creates a response, and uploads the video', async () => {
    post.mockResolvedValue({json: async () => createdResponse});
    put.mockResolvedValue({});
    const submitCallback = jest.fn();

    render(<VideoHarness submitCallback={submitCallback} />);

    recordVideo();
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() => expect(submitCallback).toHaveBeenCalledWith(true));

    expect(fetchMock).toHaveBeenCalledWith('blob:fake-audio-recording');
    expect(mockTranscribeAudio).toHaveBeenCalledWith(fakeBlob);
    expect(fetchMock).toHaveBeenCalledWith('blob:fake-recording');
    expect(post).toHaveBeenCalledWith(
      '/challenge_responses',
      JSON.stringify({
        transcript: 'Hello this is a recording',
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
    // Kicks off AI evaluation after the upload, fire-and-forget.
    expect(post).toHaveBeenCalledWith(
      '/challenge_responses/7/evaluate',
      '',
      true
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

    render(<VideoHarness submitCallback={jest.fn()} />);

    recordVideo();
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled()
    );

    // Unblock the upload so the component settles cleanly. Wrapping the
    // resolution in act() flushes the effect that reports submittability
    // back up to the (stand-in) top bar.
    await act(async () => {
      resolvePost({json: async () => createdResponse});
    });
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });

  it('re-enables submit after an upload error so the user can retry', async () => {
    post.mockRejectedValue(new Error('Network error'));
    const submitCallback = jest.fn();

    render(<VideoHarness submitCallback={submitCallback} />);

    recordVideo();
    // act() lets the async submit settle and the submittability report
    // propagate to the stand-in top bar before we assert.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
    });

    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
    // A failed upload must not be confirmed as submitted.
    expect(submitCallback).not.toHaveBeenCalled();
  });
});
