import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {FC, useRef, useState} from 'react';

import WhiteboardChallenge from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/WhiteboardChallenge';
import {ExplanationTypes} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
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

// SvgCanvas uses Fabric and the canvas API which don't run in jsdom. The stub
// renders a button that reports a drawing via onHasObjectsChange, and exposes
// getBlob / getSvgBlob through the forwarded ref.
const fakePngBlob = new Blob(['png-bytes'], {type: 'image/png'});
const fakeSvgBlob = new Blob(['<svg/>'], {type: 'image/svg+xml'});

jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/SvgCanvas',
  () => {
    const React = require('react');
    return {
      __esModule: true,
      default: React.forwardRef(
        (
          props: {onHasObjectsChange: (v: boolean) => void},
          ref: React.Ref<unknown>
        ) => {
          React.useImperativeHandle(ref, () => ({
            getBlob: async () => fakePngBlob,
            getSvgBlob: () => fakeSvgBlob,
          }));
          return React.createElement(
            'button',
            {type: 'button', onClick: () => props.onHasObjectsChange(true)},
            'Draw something'
          );
        }
      ),
    };
  }
);

// Referenced from inside jest.mock() below, so named with the "mock" prefix
// babel-plugin-jest-hoist requires for out-of-scope variables.
const mockRecordedAudioBlob = new Blob(['audio-bytes'], {type: 'audio/webm'});

// AudioRecorder relies on MediaRecorder and getUserMedia, unavailable in
// jsdom. The stub mirrors VideoRecorder's test double: two buttons drive the
// same callbacks the real recorder's state machine would fire.
// - "Start Recording" signals recording-in-progress via onIsRecordingChange(true)
// - "Stop Recording" fires the same sequence as the real onstop handler:
//   setRecordedBlob, onRecordingChange(true), onIsRecordingChange(false)
jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/AudioRecorder',
  () => {
    const React = require('react');
    return {
      __esModule: true,
      default: (props: {
        onRecordingChange: (hasRecording: boolean) => void;
        onIsRecordingChange?: (isRecording: boolean) => void;
        setRecordedBlob: (blob: Blob | null) => void;
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
                props.setRecordedBlob(mockRecordedAudioBlob);
                props.onRecordingChange(true);
                props.onIsRecordingChange?.(false);
              },
            },
            'Stop Recording'
          )
        ),
    };
  }
);

const post = HttpClient.post as jest.Mock;
const put = HttpClient.put as jest.Mock;

const createdResponse = {
  id: 7,
  assets: [
    {id: 9, asset_type: 'whiteboard_image'},
    {id: 10, asset_type: 'whiteboard_svg'},
  ],
};

// WhiteboardChallenge is a controlled component: explanation-type and
// recording state both live in the parent (ChallengeBox in production).
// This harness plays that role so the submission flow can be exercised
// end-to-end without rendering the full ChallengeBox tree.
const Harness: FC<{
  challengeId: number | null;
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
  explanationType: string | null;
  textExplanation?: string;
  starterImageUrl?: string | null;
  starterImageAltText?: string | null;
}> = ({
  challengeId,
  submitted,
  submitCallback,
  explanationType,
  textExplanation = '',
  starterImageUrl = null,
  starterImageAltText = null,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [, setEvaluationStatus] = useState('');
  const [, setChallengeResponseId] = useState(0);
  const submitRef = useRef<(() => void | Promise<void>) | null>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  return (
    <>
      <WhiteboardChallenge
        challengeId={challengeId}
        starterImageUrl={starterImageUrl}
        starterImageAltText={starterImageAltText}
        submitted={submitted}
        submitCallback={submitCallback}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        hasRecording={hasRecording}
        setHasRecording={setHasRecording}
        explanationType={explanationType}
        lessonId={1}
        textExplanation={textExplanation}
        setEvaluationStatus={setEvaluationStatus}
        setChallengeResponseId={setChallengeResponseId}
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

const recordAudio = () => {
  fireEvent.click(screen.getByRole('button', {name: 'Start Recording'}));
  fireEvent.click(screen.getByRole('button', {name: 'Stop Recording'}));
};

describe('WhiteboardChallenge', () => {
  let originalFetch: typeof globalThis.fetch | undefined;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    post.mockReset();
    put.mockReset();
    mockTranscribeAudio.mockReset();
    mockTranscribeAudio.mockResolvedValue('Hello this is a recording');
    originalFetch = (globalThis as {fetch?: typeof originalFetch}).fetch;
    fetchMock = jest.fn();
    (globalThis as unknown as {fetch?: jest.Mock}).fetch = fetchMock;
  });

  afterEach(() => {
    (globalThis as {fetch?: typeof originalFetch}).fetch = originalFetch;
  });

  it('disables submit until something is drawn', () => {
    render(
      <Harness
        challengeId={5}
        submitted={false}
        submitCallback={jest.fn()}
        explanationType={ExplanationTypes.TEXT}
        textExplanation="My explanation"
      />
    );

    expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });

  it('disables submit until an explanation modality has been chosen', () => {
    render(
      <Harness
        challengeId={5}
        submitted={false}
        submitCallback={jest.fn()}
        explanationType={null}
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
    expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();
  });

  it('disables submit in audio mode until there is a recording', () => {
    render(
      <Harness
        challengeId={5}
        submitted={false}
        submitCallback={jest.fn()}
        explanationType={ExplanationTypes.AUDIO}
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
    expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();

    recordAudio();
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });

  it('disables submit while the challenge is still loading', () => {
    render(
      <Harness
        challengeId={null}
        submitted={false}
        submitCallback={jest.fn()}
        explanationType={ExplanationTypes.TEXT}
        textExplanation="My explanation"
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
    expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();
  });

  it('creates a response, uploads PNG and SVG, then fires submitCallback', async () => {
    post.mockResolvedValue({json: async () => createdResponse});
    put.mockResolvedValue({});
    const submitCallback = jest.fn();

    render(
      <Harness
        challengeId={5}
        submitted={false}
        submitCallback={submitCallback}
        explanationType={ExplanationTypes.TEXT}
        textExplanation=""
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() => expect(submitCallback).toHaveBeenCalledWith(true));

    expect(post).toHaveBeenCalledWith(
      '/challenge_responses',
      JSON.stringify({
        challenge_id: 5,
        is_final: true,
        assets: [
          {asset_type: 'whiteboard_image'},
          {asset_type: 'whiteboard_svg'},
        ],
        transcript: null,
        student_text: '',
      }),
      true,
      {'Content-Type': 'application/json'}
    );
    expect(put).toHaveBeenCalledWith(
      '/challenge_response_assets/9/upload',
      fakePngBlob,
      true,
      {'Content-Type': 'image/png'}
    );
    expect(put).toHaveBeenCalledWith(
      '/challenge_response_assets/10/upload',
      fakeSvgBlob,
      true,
      {'Content-Type': 'image/svg+xml'}
    );
    // Fire-and-forget evaluation request.
    expect(post).toHaveBeenCalledWith(
      '/challenge_responses/7/evaluate',
      '',
      true
    );
  });

  it('submits typed text as student_text in text mode', async () => {
    post.mockResolvedValue({json: async () => createdResponse});
    put.mockResolvedValue({});
    const submitCallback = jest.fn();

    render(
      <Harness
        challengeId={5}
        submitted={false}
        submitCallback={submitCallback}
        explanationType={ExplanationTypes.TEXT}
        textExplanation="My explanation"
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() => expect(submitCallback).toHaveBeenCalledWith(true));

    expect(post).toHaveBeenCalledWith(
      '/challenge_responses',
      expect.stringContaining('"student_text":"My explanation"'),
      true,
      {'Content-Type': 'application/json'}
    );
    expect(mockTranscribeAudio).not.toHaveBeenCalled();
  });

  it('transcribes the recording and submits it as transcript in audio mode', async () => {
    post.mockResolvedValue({json: async () => createdResponse});
    put.mockResolvedValue({});
    const submitCallback = jest.fn();

    render(
      <Harness
        challengeId={5}
        submitted={false}
        submitCallback={submitCallback}
        explanationType={ExplanationTypes.AUDIO}
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
    recordAudio();
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() => expect(submitCallback).toHaveBeenCalledWith(true));

    expect(mockTranscribeAudio).toHaveBeenCalledWith(mockRecordedAudioBlob);
    expect(post).toHaveBeenCalledWith(
      '/challenge_responses',
      expect.stringContaining('"transcript":"Hello this is a recording"'),
      true,
      {'Content-Type': 'application/json'}
    );
  });
});
