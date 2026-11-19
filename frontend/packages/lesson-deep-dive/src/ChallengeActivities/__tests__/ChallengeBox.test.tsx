import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {vi} from 'vitest';

import {ChallengeTypes} from '@code-dot-org/shared-constants';

import {type Challenge} from '../../types';
import ChallengeBox from '../ChallengeBox';

vi.mock('@code-dot-org/core/api', () => {
  const client = {transport: {request: vi.fn()}};
  return {useApiClient: () => client};
});

vi.mock('../VideoCanvas', async () => await import('./stubVideoCanvas'));

const fakeChallenge: Challenge = {
  id: 1,
  lesson_id: 42,
  question: 'Draw a flowchart of the algorithm.',
  default_modality: 'video',
  whiteboard_starter_image_alt_text: null,
  whiteboard_starter_image_url: null,
};

const renderVideoChallenge = async () => {
  render(
    <MemoryRouter>
      <ChallengeBox
        lessonId={42}
        challenge={fakeChallenge}
        challengeType={ChallengeTypes.VIDEO}
        WhiteboardChallenge={() => null}
        transcribeAudio={vi.fn()}
        stickerSections={[]}
      />
    </MemoryRouter>,
  );
  await waitFor(() =>
    expect(
      screen.getByText('Draw a flowchart of the algorithm.'),
    ).toBeInTheDocument(),
  );
};

// Clicks record then stop, and waits for the stub's blob
const recordVideo = async () => {
  fireEvent.click(screen.getByRole('button', {name: 'Start Recording'}));
  fireEvent.click(screen.getByRole('button', {name: 'Stop Recording'}));
  await act(async () => {});
};

// Edit, record, preview, and back to edit
describe('ChallengeBox video challenges', () => {
  it('offers recording straight away, with nothing yet to submit', async () => {
    await renderVideoChallenge();

    expect(
      screen.getByRole('button', {name: 'Start Recording'}),
    ).toBeInTheDocument();
    // No explanation modality to pick: those belong to whiteboard.
    expect(
      screen.queryByRole('button', {name: 'Audio'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Text'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Submit'}),
    ).not.toBeInTheDocument();
  });

  it('walks the button from start, to stop, to editing the take', async () => {
    await renderVideoChallenge();

    fireEvent.click(screen.getByRole('button', {name: 'Start Recording'}));
    expect(
      screen.getByRole('button', {name: 'Stop Recording'}),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Stop Recording'}));
    await act(async () => {});
    expect(
      screen.getByRole('button', {name: 'Edit and Record Again'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });

  it('returns to the live canvas, take discarded, on Edit and Record Again', async () => {
    await renderVideoChallenge();
    await recordVideo();

    fireEvent.click(
      screen.getByRole('button', {name: 'Edit and Record Again'}),
    );

    expect(
      screen.getByRole('button', {name: 'Start Recording'}),
    ).toBeInTheDocument();
    expect(screen.getByText('canvas mode: edit')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Submit'}),
    ).not.toBeInTheDocument();
  });

  it('records a second take after editing', async () => {
    await renderVideoChallenge();
    await recordVideo();
    fireEvent.click(
      screen.getByRole('button', {name: 'Edit and Record Again'}),
    );
    await recordVideo();

    expect(screen.getByText('canvas mode: preview')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
  });
});
