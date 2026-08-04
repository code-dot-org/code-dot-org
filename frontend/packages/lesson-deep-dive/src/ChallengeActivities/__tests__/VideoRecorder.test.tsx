import {render, screen} from '@testing-library/react';

import VideoRecorder from '../VideoRecorder';

const fakeStream = () =>
  ({getTracks: () => [{stop: () => undefined}]}) as unknown as MediaStream;

const setMediaDevices = (value: unknown) => {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value,
  });
};

const renderRecorder = (props: Partial<{disabled: boolean}> = {}) =>
  render(
    <VideoRecorder
      onRecordingChange={() => undefined}
      recordedUrl={null}
      setRecordedUrl={() => undefined}
      {...props}
    />,
  );

afterEach(() => setMediaDevices(undefined));

describe('VideoRecorder', () => {
  it('shows the live preview and a record control once the camera opens', async () => {
    const getUserMedia = vi.fn().mockResolvedValue(fakeStream());
    setMediaDevices({getUserMedia});

    const {container} = renderRecorder();

    expect(
      await screen.findByRole('button', {name: 'Start Recording'}),
    ).toBeInTheDocument();
    expect(container.querySelector('video')).not.toBeNull();
    expect(getUserMedia).toHaveBeenCalledWith({video: true, audio: true});
  });

  it('explains the insecure-context case instead of offering to record', async () => {
    setMediaDevices(undefined);

    renderRecorder();

    expect(
      await screen.findByText(/Camera recording is not available on this page/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('explains a denied permission instead of offering to record', async () => {
    setMediaDevices({getUserMedia: vi.fn().mockRejectedValue(new Error('no'))});

    renderRecorder();

    expect(
      await screen.findByText(/Camera or microphone access was denied/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
