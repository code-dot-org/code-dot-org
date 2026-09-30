import {describe, expect, it, vi} from 'vitest';

import * as sounds from '../../audio/sounds';
import playSound, {
  PLAY_SOUND_OPTIONS,
  SoundDropdown,
} from '../blockDefinitions/playSound';

vi.mock('../../audio/sounds', () => ({playSound: vi.fn()}));

describe('spritelab2_playSound', () => {
  it('offers distinct labels and values', () => {
    const labels = PLAY_SOUND_OPTIONS.map(([label]) => label);
    const values = PLAY_SOUND_OPTIONS.map(([, value]) => value);
    expect(new Set(labels).size).toBe(labels.length);
    expect(new Set(values).size).toBe(values.length);
  });

  it('plays the sound once when it is picked from the menu, not when set', () => {
    const field = new SoundDropdown(PLAY_SOUND_OPTIONS);
    const [, boing] = PLAY_SOUND_OPTIONS[1];
    // A load sets the value directly.
    field.setValue(boing);
    expect(sounds.playSound).not.toHaveBeenCalled();
    // A pick goes through the menu.
    const [, coin] = PLAY_SOUND_OPTIONS[3];
    const menuItem = {getValue: () => coin} as never;
    (
      field as unknown as {onItemSelected_: (m: never, i: never) => void}
    ).onItemSelected_({} as never, menuItem);
    expect(field.getValue()).toBe(coin);
    expect(sounds.playSound).toHaveBeenCalledTimes(1);
    expect(sounds.playSound).toHaveBeenCalledWith(coin);
  });

  it('generates a playSound call with the chosen URL', () => {
    const [, value] = PLAY_SOUND_OPTIONS[0];
    const block = {getFieldValue: () => value};
    expect(playSound.generator(block as never, {} as never, {} as never)).toBe(
      `playSound(${JSON.stringify(value)});\n`,
    );
  });
});
