import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {FC, useState} from 'react';

import WhiteboardChallenge from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/WhiteboardChallenge';
import {ExplanationTypes} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import {ReactFlowSketchLabSources} from '@cdo/apps/sketchlab/reactFlow/types';
import {createSketchSnapshotBlob} from '@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob';
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

jest.mock(
  '@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob',
  () => ({
    createSketchSnapshotBlob: jest.fn(),
  })
);

// React Flow does not render in jsdom. The stub exposes a button that
// reports one node through updateSources, simulating the student drawing.
jest.mock('@cdo/apps/sketchlab/reactFlow/components/ReactFlowCanvas', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: {
      updateSources: (sources: ReactFlowSketchLabSources) => void;
    }) =>
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: () =>
            props.updateSources({
              source: {nodes: [{id: 'n1'}], edges: []},
            } as unknown as ReactFlowSketchLabSources),
        },
        'Draw something'
      ),
  };
});

// AudioRecorder relies on MediaRecorder and getUserMedia, unavailable in
// jsdom. The stub mirrors VideoRecorder's test double: two buttons drive the
// same callbacks the real recorder's state machine would fire.
// - "Start Recording" signals recording-in-progress via onIsRecordingChange(true)
// - "Stop Recording" fires the same sequence as the real onstop handler:
//   setRecordedUrl, onRecordingChange(true), onIsRecordingChange(false)
jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/AudioRecorder',
  () => {
    const React = require('react');
    return {
      __esModule: true,
      default: (props: {
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
  }
);

const post = HttpClient.post as jest.Mock;
const put = HttpClient.put as jest.Mock;
const snapshot = createSketchSnapshotBlob as jest.Mock;

const fakeBlob = new Blob(['png-bytes'], {type: 'image/png'});
const fakeAudioBlob = new Blob(['audio-bytes'], {type: 'audio/webm'});
const createdResponse = {
  id: 7,
  assets: [{id: 9, asset_type: 'whiteboard_image'}],
};

// WhiteboardChallenge is a controlled component: the explanation-type
// toggle and the isRecording/hasRecording state it needs both live in
// ChallengeBox. This harness plays ChallengeBox's role so the recording
// state round-trips through the mocked AudioRecorder like it would in app.
const Harness: FC<{
  challengeId: number | null;
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
  explanationType: string | null;
  textExplanation?: string;
}> = ({
  challengeId,
  submitted,
  submitCallback,
  explanationType,
  textExplanation = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  return (
    <WhiteboardChallenge
      challengeId={challengeId}
      submitted={submitted}
      submitCallback={submitCallback}
      isRecording={isRecording}
      setIsRecording={setIsRecording}
      hasRecording={hasRecording}
      setHasRecording={setHasRecording}
      explanationType={explanationType}
      lessonId={1}
      textExplanation={textExplanation}
    />
  );
};

// Helper: simulate the full record → stop sequence via the mocked AudioRecorder.
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
    snapshot.mockReset();
    mockTranscribeAudio.mockReset();
    mockTranscribeAudio.mockResolvedValue('Hello this is a recording');
    originalFetch = (globalThis as {fetch?: typeof originalFetch}).fetch;
    fetchMock = jest.fn().mockResolvedValue({blob: async () => fakeAudioBlob});
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
        explanationType={null}
      />
    );

    const submitButton = screen.getByRole('button', {name: 'Submit'});
    expect(submitButton).toBeDisabled();

    fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
    expect(submitButton).toBeEnabled();
  });

  it('disables submit while the challenge is still loading', () => {
    render(
      <Harness
        challengeId={null}
        submitted={false}
        submitCallback={jest.fn()}
        explanationType={null}
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
    expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();
  });

  it('snapshots the canvas, creates a response, and uploads the image', async () => {
    snapshot.mockResolvedValue({blob: fakeBlob});
    post.mockResolvedValue({json: async () => createdResponse});
    put.mockResolvedValue({});
    const submitCallback = jest.fn();

    render(
      <Harness
        challengeId={5}
        submitted={false}
        submitCallback={submitCallback}
        explanationType={null}
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
        assets: [{asset_type: 'whiteboard_image'}],
        transcript: null,
        student_text: null,
      }),
      true,
      {'Content-Type': 'application/json'}
    );
    expect(put).toHaveBeenCalledWith(
      '/challenge_response_assets/9/upload',
      fakeBlob,
      true,
      {'Content-Type': 'image/png'}
    );
    // Kicks off AI evaluation after the upload, fire-and-forget.
    expect(post).toHaveBeenCalledWith(
      '/challenge_responses/7/evaluate',
      '',
      true
    );
  });

  it('shows an error and stays submittable when the capture fails', async () => {
    snapshot.mockResolvedValue({error: 'Could not capture your drawing.'});
    const submitCallback = jest.fn();

    render(
      <Harness
        challengeId={5}
        submitted={false}
        submitCallback={submitCallback}
        explanationType={null}
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() =>
      expect(
        screen.getByText('Could not capture your drawing.')
      ).toBeInTheDocument()
    );
    expect(post).not.toHaveBeenCalled();
    expect(submitCallback).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });

  it('submits the typed explanation as student_text in text mode', async () => {
    snapshot.mockResolvedValue({blob: fakeBlob});
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
      JSON.stringify({
        challenge_id: 5,
        is_final: true,
        assets: [{asset_type: 'whiteboard_image'}],
        transcript: null,
        student_text: 'My explanation',
      }),
      true,
      {'Content-Type': 'application/json'}
    );
    expect(mockTranscribeAudio).not.toHaveBeenCalled();
  });

  it('transcribes the recording and submits it as transcript in audio mode', async () => {
    snapshot.mockResolvedValue({blob: fakeBlob});
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

    expect(fetchMock).toHaveBeenCalledWith('blob:fake-recording');
    expect(mockTranscribeAudio).toHaveBeenCalledWith(fakeAudioBlob);
    expect(post).toHaveBeenCalledWith(
      '/challenge_responses',
      JSON.stringify({
        challenge_id: 5,
        is_final: true,
        assets: [{asset_type: 'whiteboard_image'}],
        transcript: 'Hello this is a recording',
        student_text: null,
      }),
      true,
      {'Content-Type': 'application/json'}
    );
  });
});
