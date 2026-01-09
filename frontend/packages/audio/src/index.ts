import MusicController, {
  MusicTrack,
  MusicTrackDefinition,
} from './MusicController';
export {MusicController};
export type {MusicTrack, MusicTrackDefinition};
import Sound from './Sound';
import type {SoundConfig, PlaybackOptions} from './Sound';
export {Sound, SoundConfig, PlaybackOptions};
import SoundBoard from './SoundBoard';
export {SoundBoard};
import ThreeSliceAudio, {ThreeSliceAudioDefinition} from './ThreeSliceAudio';
export {ThreeSliceAudio};
export type {ThreeSliceAudioDefinition};
export default SoundBoard;
