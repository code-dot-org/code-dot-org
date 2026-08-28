import {describe, expect, it} from 'vitest';

import {
  buildFishLevelProperties,
  buildMazeLevelProperties,
  buildMusicLevelProperties,
} from '../levelProperties';
import {parseLevelXml} from '../levelXml';

// Excerpt of dashboard/config/levels/custom/fish/Oceans_CreaturesVTrash_2024.level
// — a real level whose `mode` differs from the FishVTrash level used
// elsewhere as the "level 1" fixture, so the two attach to different Oceans
// activities.
const CREATURES_VS_TRASH_LEVEL = `<Fish>
  <config><![CDATA[{
  "properties": {
    "mode": "creaturesvtrash",
    "guides": "K5",
    "background": "oceans-blue",
    "name_suffix": "_2024"
  },
  "published": true
}]]></config>
</Fish>`;

// Excerpt of
// dashboard/config/levels/custom/music/coding-with-music-loop-together.level
const MUSIC_LEVEL_WITH_VALIDATIONS = `<Music>
  <config><![CDATA[{
  "properties": {
    "offer_browser_tts": "true",
    "validations": [
      {
        "key": "music-coding-intro-loop-beat_bf0ed4a4-3139-4a89-b2c9-860c44654230",
        "message": "Great work! You used a loop to repeat the drum beat for the length of the song. ",
        "next": true,
        "conditions": [
          {"name": "played_anything_in_same_loop", "value": 3},
          {"name": "played_sound_id", "value": "shakira_whenever_wherever/percussion_beat"}
        ]
      },
      {
        "key": "music-coding-intro-loop-beat_ebe3dea6-16d1-429f-93e5-2bf8bc327af2",
        "message": "The drum loop played twice. Change the number in the loop so the sounds repeat for the length of the song. ",
        "next": false,
        "conditions": [
          {"name": "played_anything_in_same_loop", "value": 2},
          {"name": "played_sound_id", "value": "shakira_whenever_wherever/percussion_beat"}
        ],
        "callout": "repeat-block-field-workspace"
      }
    ]
  }
}]]></config>
</Music>`;

describe('buildFishLevelProperties', () => {
  it('carries mode/guides through for the studio Oceans adapter, alongside appMode', () => {
    const parsed = parseLevelXml(CREATURES_VS_TRASH_LEVEL);
    const properties = buildFishLevelProperties(
      1,
      'level-key',
      parsed.properties,
    );
    expect(properties.mode).toBe('creaturesvtrash');
    expect(properties.guides).toBe('K5');
    expect(properties.appMode).toBe('creaturesvtrash');
  });

  it('defaults offerBrowserTts to false when the level does not set it', () => {
    const parsed = parseLevelXml(CREATURES_VS_TRASH_LEVEL);
    const properties = buildFishLevelProperties(
      1,
      'level-key',
      parsed.properties,
    );
    expect(properties.offerBrowserTts).toBe(false);
  });
});

describe('buildMusicLevelProperties', () => {
  it('carries validations through for ProgressManager', () => {
    const parsed = parseLevelXml(MUSIC_LEVEL_WITH_VALIDATIONS);
    const properties = buildMusicLevelProperties(
      1,
      'level-key',
      parsed.properties,
    );
    expect(Array.isArray(properties.validations)).toBe(true);
    expect(properties.validations).toHaveLength(2);
    expect((properties.validations as {key: string}[])[0].key).toBe(
      'music-coding-intro-loop-beat_bf0ed4a4-3139-4a89-b2c9-860c44654230',
    );
  });

  it('coerces the stringly-typed offer_browser_tts property to a real boolean', () => {
    const parsed = parseLevelXml(MUSIC_LEVEL_WITH_VALIDATIONS);
    const properties = buildMusicLevelProperties(
      1,
      'level-key',
      parsed.properties,
    );
    expect(properties.offerBrowserTts).toBe(true);
  });
});

describe('buildMazeLevelProperties', () => {
  // Pins the fix for Author Mode gate #2/#3: packages/labs/maze/src/Bee.ts
  // reads level.flowerType/nectarGoal/honeyGoal — camelCase — but a real
  // .level file's config sets flower_type/nectar_goal/honey_goal in
  // snake_case. The raw `...properties` spread this function does for
  // everything else leaves those keys snake_case, so the engine's own
  // `level.flowerType` read always saw undefined; each needs its own
  // camelCase assignment.
  it('camelizes flower_type/nectar_goal/honey_goal/min_collected for the engine to read', () => {
    const properties = buildMazeLevelProperties(1, 'level-key', 'Maze', {
      properties: {
        flower_type: 'purpleNectarHidden',
        nectar_goal: '3',
        honey_goal: '1',
        min_collected: '4',
      },
    });
    expect(properties.flowerType).toBe('purpleNectarHidden');
    expect(properties.nectarGoal).toBe('3');
    expect(properties.honeyGoal).toBe('1');
    expect(properties.minCollected).toBe('4');
    // The raw snake_case keys still ride along (harmless passthrough) —
    // this only pins that the camelCase names the engine reads exist too.
    expect(properties.flower_type).toBe('purpleNectarHidden');
  });

  it('leaves the camelCase goal fields undefined when the level sets none', () => {
    const properties = buildMazeLevelProperties(1, 'level-key', 'Maze', {
      properties: {},
    });
    expect(properties.flowerType).toBeUndefined();
    expect(properties.nectarGoal).toBeUndefined();
    expect(properties.honeyGoal).toBeUndefined();
    expect(properties.minCollected).toBeUndefined();
  });
});
