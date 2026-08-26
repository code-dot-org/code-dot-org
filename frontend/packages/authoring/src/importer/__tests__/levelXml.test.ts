import {describe, expect, it} from 'vitest';

import {parseLevelXml} from '../levelXml';

// Excerpt of dashboard/config/levels/custom/fish/Oceans_FishVTrash_2024.level
const FISH_LEVEL = `<Fish>
  <config><![CDATA[{
  "game_id": 66,
  "properties": {
    "mode": "fishvtrash",
    "guides": "K5",
    "background": "oceans-blue",
    "name_suffix": "_2024"
  },
  "published": true
}]]></config>
</Fish>`;

// Excerpt of dashboard/config/levels/custom/dance/dance_ai_customize_effect_2024.level
// — a <blocks> sibling follows the <config> block.
const LEVEL_WITH_BLOCKS = `<Dancelab>
  <config><![CDATA[{
  "properties": {
    "skin": "dance"
  }
}]]></config>
  <blocks>
    <start_blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="Dancelab_whenSetup" />
      </xml>
    </start_blocks>
  </blocks>
</Dancelab>`;

// Excerpt of dashboard/config/levels/custom/music/add_a_new_sound_keyboard_navigation.level
const MUSIC_LEVEL_SELF_CLOSING_BLOCKS = `<Music>
  <config><![CDATA[{
  "properties": {
    "preload_asset_list": null
  },
  "published": true
}]]></config>
  <blocks/>
</Music>`;

// Excerpt of dashboard/config/levels/custom/maze/20hr_farmer_stage9_1.level
const KAREL_LEVEL = `<Karel>
  <config><![CDATA[{
  "properties": {
    "skin": "farmer"
  }
}]]></config>
  <blocks>
    <start_blocks>
      <xml>
        <block type="when_run" deletable="false" movable="false">
          <next>
            <block type="maze_moveForward"/>
          </next>
        </block>
      </xml>
    </start_blocks>
    <toolbox_blocks>
      <xml>
        <block type="maze_moveForward"/>
        <block type="maze_dig"/>
      </xml>
    </toolbox_blocks>
    <solution_blocks>
      <xml>
        <block type="maze_moveForward"/>
      </xml>
    </solution_blocks>
  </blocks>
</Karel>`;

describe('parseLevelXml', () => {
  it('extracts the root tag as levelType and the config properties', () => {
    const parsed = parseLevelXml(FISH_LEVEL);
    expect(parsed.levelType).toBe('Fish');
    expect(parsed.properties.mode).toBe('fishvtrash');
    expect(parsed.properties.guides).toBe('K5');
  });

  it('captures a trailing <blocks>...</blocks> sibling verbatim', () => {
    const parsed = parseLevelXml(LEVEL_WITH_BLOCKS);
    expect(parsed.levelType).toBe('Dancelab');
    expect(parsed.blocks).toContain('<start_blocks>');
    expect(parsed.blocks).toContain('Dancelab_whenSetup');
  });

  it('captures a self-closing <blocks/> sibling', () => {
    const parsed = parseLevelXml(MUSIC_LEVEL_SELF_CLOSING_BLOCKS);
    expect(parsed.levelType).toBe('Music');
    expect(parsed.blocks).toBe('<blocks/>');
  });

  it('leaves blocks undefined when there is no <blocks> sibling', () => {
    const parsed = parseLevelXml(FISH_LEVEL);
    expect(parsed.blocks).toBeUndefined();
  });

  it('extracts start/toolbox/solution blocks from a Karel-family level', () => {
    const parsed = parseLevelXml(KAREL_LEVEL);
    expect(parsed.levelType).toBe('Karel');
    expect(parsed.startBlocksXml).toContain('when_run');
    expect(parsed.toolboxBlocksXml).toContain('maze_dig');
    expect(parsed.solutionBlocksXml).toContain('maze_moveForward');
    expect(parsed.recommendedBlocksXml).toBeUndefined();
  });

  it('leaves the named blocks fields undefined when there is no <blocks> sibling', () => {
    const parsed = parseLevelXml(FISH_LEVEL);
    expect(parsed.startBlocksXml).toBeUndefined();
    expect(parsed.toolboxBlocksXml).toBeUndefined();
    expect(parsed.solutionBlocksXml).toBeUndefined();
  });

  it('throws when there is no <config> CDATA block', () => {
    expect(() => parseLevelXml('<Fish></Fish>')).toThrow();
  });

  it('throws when there is no root tag', () => {
    expect(() => parseLevelXml('not xml at all')).toThrow();
  });
});
