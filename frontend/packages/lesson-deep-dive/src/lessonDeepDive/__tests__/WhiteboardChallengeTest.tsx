import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import WhiteboardChallenge from '../ChallengeActivities/WhiteboardChallenge';
import {ReactFlowSketchLabSources} from '@cdo/apps/sketchlab/reactFlow/types';
import {createSketchSnapshotBlob} from '@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob';
import HttpClient from '@cdo/apps/util/HttpClient';

vi.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {post: vi.fn(), put: vi.fn()},
}));

vi.mock('@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob', () => ({
  createSketchSnapshotBlob: vi.fn(),
}));

// React Flow does not render in jsdom. The stub exposes a button that
// reports one node through updateSources, simulating the student drawing.
vi.mock(
  '@cdo/apps/sketchlab/reactFlow/components/ReactFlowCanvas',
  async () => {
    const React = (await import('react')).default;
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
          'Draw something',
        ),
    };
  },
);

const post = HttpClient.post as jest.Mock;
const put = HttpClient.put as jest.Mock;
const snapshot = createSketchSnapshotBlob as jest.Mock;

const fakeBlob = new Blob(['png-bytes'], {type: 'image/png'});
const createdResponse = {
  id: 7,
  assets: [{id: 9, asset_type: 'whiteboard_image'}],
};

describe('WhiteboardChallenge', () => {
  beforeEach(() => {
    post.mockReset();
    put.mockReset();
    snapshot.mockReset();
  });

  it('disables submit until something is drawn', () => {
    render(
      <WhiteboardChallenge
        challengeId={5}
        submitted={false}
        submitCallback={vi.fn()}
      />,
    );

    const submitButton = screen.getByRole('button', {name: 'Submit'});
    expect(submitButton).toBeDisabled();

    fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
    expect(submitButton).toBeEnabled();
  });

  it('disables submit while the challenge is still loading', () => {
    render(
      <WhiteboardChallenge
        challengeId={null}
        submitted={false}
        submitCallback={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
    expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();
  });

  it('snapshots the canvas, creates a response, and uploads the image', async () => {
    snapshot.mockResolvedValue({blob: fakeBlob});
    post.mockResolvedValue({json: async () => createdResponse});
    put.mockResolvedValue({});
    const submitCallback = vi.fn();

    render(
      <WhiteboardChallenge
        challengeId={5}
        submitted={false}
        submitCallback={submitCallback}
      />,
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
      }),
      true,
      {'Content-Type': 'application/json'},
    );
    expect(put).toHaveBeenCalledWith(
      '/challenge_response_assets/9/upload',
      fakeBlob,
      true,
      {'Content-Type': 'image/png'},
    );
  });

  it('shows an error and stays submittable when the capture fails', async () => {
    snapshot.mockResolvedValue({error: 'Could not capture your drawing.'});
    const submitCallback = vi.fn();

    render(
      <WhiteboardChallenge
        challengeId={5}
        submitted={false}
        submitCallback={submitCallback}
      />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Draw something'}));
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() =>
      expect(
        screen.getByText('Could not capture your drawing.'),
      ).toBeInTheDocument(),
    );
    expect(post).not.toHaveBeenCalled();
    expect(submitCallback).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });
});
