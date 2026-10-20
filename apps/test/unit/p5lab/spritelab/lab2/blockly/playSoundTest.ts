import {commands as audioCommands} from '@cdo/apps/lib/util/audioApi';
import playSound, {
  PLAY_SOUND_OPTIONS,
  SoundDropdown,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/playSound';
import soundLibrary from '@cdo/static/json/code-studio/soundLibrary.json';

jest.mock('@cdo/apps/lib/util/audioApi', () => ({
  commands: {playSound: jest.fn()},
}));

// The manifest lists each sound as "category_x/name" with no extension; the
// block stores the legacy "sound://category_x/name.mp3" URL.
const manifestPaths = new Set<string>(
  Object.values(soundLibrary.categories as Record<string, string[]>).flat()
);

describe('spritelab2_playSound', () => {
  it('offers distinct labels and values', () => {
    const labels = PLAY_SOUND_OPTIONS.map(([label]) => label);
    const values = PLAY_SOUND_OPTIONS.map(([, value]) => value);
    expect(new Set(labels).size).toBe(labels.length);
    expect(new Set(values).size).toBe(values.length);
  });

  it('points every option at a sound the library ships', () => {
    PLAY_SOUND_OPTIONS.forEach(([, value]) => {
      const match = /^sound:\/\/(.+)\.mp3$/.exec(value);
      expect(match).not.toBeNull();
      expect(manifestPaths.has(match![1])).toBe(true);
    });
  });

  it('plays the sound once when it is picked from the menu, not when set', () => {
    const field = new SoundDropdown(PLAY_SOUND_OPTIONS);
    const [, boing] = PLAY_SOUND_OPTIONS[1];
    // A load sets the value directly.
    field.setValue(boing);
    expect(audioCommands.playSound).not.toHaveBeenCalled();
    // A pick goes through the menu.
    const [, coin] = PLAY_SOUND_OPTIONS[3];
    const menuItem = {getValue: () => coin} as never;
    (
      field as unknown as {onItemSelected_: (m: never, i: never) => void}
    ).onItemSelected_({} as never, menuItem);
    expect(field.getValue()).toBe(coin);
    expect(audioCommands.playSound).toHaveBeenCalledTimes(1);
    expect(audioCommands.playSound).toHaveBeenCalledWith({
      url: coin,
      loop: false,
    });
  });

  it('generates a playSound call with the chosen URL', () => {
    const [, value] = PLAY_SOUND_OPTIONS[0];
    const block = {getFieldValue: () => value};
    expect(playSound.generator(block as never, {} as never)).toBe(
      `playSound(${JSON.stringify(value)});\n`
    );
  });
});
