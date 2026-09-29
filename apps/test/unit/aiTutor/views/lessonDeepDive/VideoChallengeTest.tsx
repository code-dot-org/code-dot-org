import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {FC, useRef, useState} from 'react';

import VideoChallenge from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/VideoChallenge';
import HttpClient from '@cdo/apps/util/HttpClient';

import {
  recordedAudioBlob,
  recordedVideoBlob,
} from '../../../../util/stubVideoCanvas';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {post: jest.fn(), put: jest.fn()},
}));

const mockTranscribeAudio = jest.fn();

jest.mock('@cdo/apps/aichat/api/client', () => ({
  __esModule: true,
  getClientApi: jest.fn(async () => ({transcribeAudio: mockTranscribeAudio})),
}));

// See the stub for what it reproduces of the real canvas, and why.
jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/VideoCanvas',
  () => jest.requireActual('../../../../util/stubVideoCanvas')
);

const post = HttpClient.post as jest.Mock;
const put = HttpClient.put as jest.Mock;
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
  whiteboard_starter_image_url: null,
};

// Clicks record then stop, and waits for the stub's blob
const recordVideo = async () => {
  fireEvent.click(screen.getByRole('button', {name: 'Start Recording'}));
  fireEvent.click(screen.getByRole('button', {name: 'Stop Recording'}));
  await act(async () => {});
};

// Stands in for ChallengeBox, which owns the record and "Submit" buttons
const VideoHarness: FC<{
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({submitCallback}) => {
  const submitRef = useRef<(() => void | Promise<void>) | null>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const isVideoPreview = hasRecording && !isRecording;
  return (
    <>
      <VideoChallenge
        challenge={fakeChallenge}
        submitted={false}
        submitCallback={submitCallback}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        hasRecording={hasRecording}
        setHasRecording={setHasRecording}
        lessonId={1}
        setEvaluationStatus={jest.fn()}
        setChallengeResponseId={jest.fn()}
        onSubmittableChange={setCanSubmit}
        submitRef={submitRef}
        resetRef={resetRef}
      />
      <button
        type="button"
        onClick={() =>
          isVideoPreview ? setHasRecording(false) : setIsRecording(!isRecording)
        }
      >
        {isRecording
          ? 'Stop Recording'
          : isVideoPreview
          ? 'Edit and Record Again'
          : 'Start Recording'}
      </button>
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
  beforeEach(() => {
    post.mockReset();
    put.mockReset();
    mockTranscribeAudio.mockReset();
    mockTranscribeAudio.mockResolvedValue('Hello this is a recording');
  });

  it('disables submit until a video is recorded', async () => {
    render(<VideoHarness submitCallback={jest.fn()} />);

    expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();

    await recordVideo();
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });

  it('disables submit while recording is in progress', async () => {
    render(<VideoHarness submitCallback={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', {name: 'Start Recording'}));
    expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();

    fireEvent.click(screen.getByRole('button', {name: 'Stop Recording'}));
    await act(async () => {});
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });

  it('cycles the canvas through edit, recording and preview', async () => {
    render(<VideoHarness submitCallback={jest.fn()} />);

    expect(screen.getByText('canvas mode: edit')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Start Recording'}));
    expect(screen.getByText('canvas mode: recording')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Stop Recording'}));
    await act(async () => {});
    expect(screen.getByText('canvas mode: preview')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {name: 'Edit and Record Again'})
    );
    expect(screen.getByText('canvas mode: edit')).toBeInTheDocument();
  });

  it('keeps the take while the recorder is still handing over its blob', async () => {
    render(<VideoHarness submitCallback={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', {name: 'Start Recording'}));
    fireEvent.click(screen.getByRole('button', {name: 'Stop Recording'}));

    // The caller already reads 'edit', but the take isn't discarded
    expect(screen.getByText('canvas mode: recording')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Start Recording'})
    ).toBeInTheDocument();

    await act(async () => {});

    expect(screen.getByText('canvas mode: preview')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Edit and Record Again'})
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });

  it('discards the recorded take when returning to edit', async () => {
    render(<VideoHarness submitCallback={jest.fn()} />);

    await recordVideo();
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();

    fireEvent.click(
      screen.getByRole('button', {name: 'Edit and Record Again'})
    );

    expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();
    expect(
      screen.getByRole('button', {name: 'Start Recording'})
    ).toBeInTheDocument();
  });

  it('records a second take after returning to edit', async () => {
    render(<VideoHarness submitCallback={jest.fn()} />);

    await recordVideo();
    fireEvent.click(
      screen.getByRole('button', {name: 'Edit and Record Again'})
    );
    await recordVideo();

    expect(screen.getByText('canvas mode: preview')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });

  it('transcribes the audio blob, creates a response, and uploads the video blob', async () => {
    post.mockResolvedValue({json: async () => createdResponse});
    put.mockResolvedValue({});
    const submitCallback = jest.fn();

    render(<VideoHarness submitCallback={submitCallback} />);

    await recordVideo();
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() => expect(submitCallback).toHaveBeenCalledWith(true));

    expect(mockTranscribeAudio).toHaveBeenCalledWith(recordedAudioBlob);
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
      recordedVideoBlob,
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

    await recordVideo();
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

    await recordVideo();
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
