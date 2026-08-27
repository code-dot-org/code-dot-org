import {describe, expect, it} from 'vitest';

import {buildFishLevelProperties} from '../levelProperties';
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
