import {GeneratedEffect} from '../types';

// Returns XML for a generated effect's blocks.
export const generateAiEffectBlocksXmlFromResult = (
  result: GeneratedEffect
) => {
  return `
    <xml>
      <block type="Dancelab_setForegroundEffectExtended">
        <field name="EFFECT">"${result.foregroundEffect}"</field>
        <next>
          <block type="Dancelab_setBackgroundEffectWithPaletteAI">
            <field name="PALETTE">"${result.backgroundColor}"</field>
            <field name="EFFECT">"${result.backgroundEffect}"</field>
          </block>
        </next>
      </block>
    </xml>
  `;
};
