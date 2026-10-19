// The subset of HTMLMediaElement that <json-video> implements. textTracks,
// buffered, seekable and played are look-alikes, not the native classes.
export declare class JsonVideo extends HTMLElement {
  static readonly NETWORK_EMPTY: 0;
  static readonly NETWORK_IDLE: 1;
  static readonly NETWORK_LOADING: 2;
  static readonly NETWORK_NO_SOURCE: 3;
  static readonly HAVE_NOTHING: 0;
  static readonly HAVE_METADATA: 1;
  static readonly HAVE_CURRENT_DATA: 2;
  static readonly HAVE_FUTURE_DATA: 3;
  static readonly HAVE_ENOUGH_DATA: 4;
  readonly NETWORK_EMPTY: 0;
  readonly NETWORK_IDLE: 1;
  readonly NETWORK_LOADING: 2;
  readonly NETWORK_NO_SOURCE: 3;
  readonly HAVE_NOTHING: 0;
  readonly HAVE_METADATA: 1;
  readonly HAVE_CURRENT_DATA: 2;
  readonly HAVE_FUTURE_DATA: 3;
  readonly HAVE_ENOUGH_DATA: 4;

  src: string;
  readonly currentSrc: string;
  poster: string;
  controls: boolean;
  autoplay: boolean;
  loop: boolean;
  defaultMuted: boolean;
  muted: boolean;
  volume: number;
  playbackRate: number;
  defaultPlaybackRate: number;
  currentTime: number;
  readonly duration: number;
  readonly paused: boolean;
  readonly ended: boolean;
  readonly seeking: boolean;
  readonly readyState: number;
  readonly networkState: number;
  readonly error: MediaError | null;
  readonly buffered: TimeRanges;
  readonly seekable: TimeRanges;
  readonly played: TimeRanges;
  readonly textTracks: TextTrackList;

  load(): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  fastSeek(time: number): void;
  canPlayType(type: string): CanPlayTypeResult;
  /** @deprecated Milliseconds; use currentTime. */
  seekTo(ms: number): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'json-video': JsonVideo;
  }
}
