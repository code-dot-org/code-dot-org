import {commands as audioCommands} from '@cdo/apps/lib/util/audioApi';
import playSound, {
  PLAY_SOUND_OPTIONS,
  SoundDropdown,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/playSound';
import * as soundEffects from '@cdo/apps/p5lab/spritelab/lab2/soundEffects';
import soundLibrary from '@cdo/static/json/code-studio/soundLibrary.json';

jest.mock('@cdo/apps/lib/util/audioApi', () => ({
  commands: {playSound: jest.fn()},
}));
jest.mock('@cdo/apps/p5lab/spritelab/lab2/soundEffects', () => ({
  ...jest.requireActual('@cdo/apps/p5lab/spritelab/lab2/soundEffects'),
  playPreset: jest.fn(),
}));

// The manifest lists each sound as "category_x/name" with no extension; the
// block stores the legacy "sound://category_x/name.mp3" URL.
const manifestPaths = new Set<string>(
  Object.values(soundLibrary.categories as Record<string, string[]>).flat()
);

const isFile = ([, value]: [string, string]) => value.startsWith('sound://');
const valueOf = (label: string) =>
  PLAY_SOUND_OPTIONS.find(([l]) => l === label)![1];
const pick = (field: SoundDropdown, value: string) =>
  (
    field as unknown as {onItemSelected_: (m: never, i: never) => void}
  ).onItemSelected_({} as never, {getValue: () => value} as never);

describe('spritelab2_playSound', () => {
  beforeEach(() => {
    (audioCommands.playSound as jest.Mock).mockClear();
    (soundEffects.playPreset as jest.Mock).mockClear();
  });

  it('offers distinct labels and values', () => {
    const labels = PLAY_SOUND_OPTIONS.map(([label]) => label);
    const values = PLAY_SOUND_OPTIONS.map(([, value]) => value);
    expect(new Set(labels).size).toBe(labels.length);
    expect(new Set(values).size).toBe(values.length);
  });

  it('lists synth sounds, then files, each group alphabetical', () => {
    const synth = PLAY_SOUND_OPTIONS.filter(option => !isFile(option));
    const files = PLAY_SOUND_OPTIONS.filter(isFile);
    expect(synth.length).toBeGreaterThan(0);
    expect(PLAY_SOUND_OPTIONS).toEqual([...synth, ...files]);
    [synth, files].forEach(group => {
      const labels = group.map(([label]) => label);
      expect(labels).toEqual([...labels].sort());
    });
  });

  it('points every file option at a sound the library ships', () => {
    PLAY_SOUND_OPTIONS.filter(isFile).forEach(([, value]) => {
      const match = /^sound:\/\/(.+)\.mp3$/.exec(value);
      expect(match).not.toBeNull();
      expect(manifestPaths.has(match![1])).toBe(true);
    });
  });

  it('points every synth option at a preset', () => {
    PLAY_SOUND_OPTIONS.filter(option => !isFile(option)).forEach(
      ([, value]) => {
        expect(soundEffects.synthPresetOf(value)).not.toBeNull();
      }
    );
    expect(soundEffects.synthPresetOf('synth://nope')).toBeNull();
    expect(soundEffects.synthPresetOf('synth://toString')).toBeNull();
    expect(soundEffects.synthPresetOf('sound://x.mp3')).toBeNull();
  });

  it('plays a file once when it is picked from the menu, not when set', () => {
    const field = new SoundDropdown(PLAY_SOUND_OPTIONS);
    // A load sets the value directly.
    field.setValue(valueOf('boing'));
    expect(audioCommands.playSound).not.toHaveBeenCalled();
    // A pick goes through the menu.
    const coin = valueOf('coin');
    pick(field, coin);
    expect(field.getValue()).toBe(coin);
    expect(audioCommands.playSound).toHaveBeenCalledTimes(1);
    expect(audioCommands.playSound).toHaveBeenCalledWith({
      url: coin,
      loop: false,
    });
  });

  it('previews a synth pick through the synth, not the file player', () => {
    const field = new SoundDropdown(PLAY_SOUND_OPTIONS);
    pick(field, valueOf('hop'));
    expect(soundEffects.playPreset).toHaveBeenCalledWith('jump');
    expect(audioCommands.playSound).not.toHaveBeenCalled();
  });

  it('generates a playSound call with the chosen value', () => {
    const value = valueOf('zap');
    const block = {getFieldValue: () => value};
    expect(playSound.generator(block as never, {} as never)).toBe(
      `playSound(${JSON.stringify(value)});\n`
    );
  });
});
