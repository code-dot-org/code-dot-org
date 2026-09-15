import playSound, {
  PLAY_SOUND_OPTIONS,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/playSound';
import soundLibrary from '@cdo/static/json/code-studio/soundLibrary.json';

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

  it('generates a playSound call with the chosen URL', () => {
    const [, value] = PLAY_SOUND_OPTIONS[0];
    const block = {getFieldValue: () => value};
    expect(playSound.generator(block as never, {} as never)).toBe(
      `playSound(${JSON.stringify(value)});\n`
    );
  });
});
