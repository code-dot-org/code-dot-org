import {describe, expect, it} from 'vitest';

import {
  buildFishLevelProperties,
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
});
