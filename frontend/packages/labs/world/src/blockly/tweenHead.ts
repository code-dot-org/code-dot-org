// The block an actor's tween is written under, on its page
// (specs/TWEENS_AS_DATA_PLAN.md): "fade out over ⟨1⟩ seconds, steadily",
// with its destinations below it. The page turns the head back into the
// tween (`actors/actorTweens`); the compiler loads one from the data and
// writes the tween's constant from it (`BlocklyGenerator.actorCode`).

import * as Blockly from 'blockly/core';

import {defineBlock, defineExtension} from '@code-dot-org/blockly';

import {TWEEN_HEAD} from './pageHeads';
import {CURVE_OPTIONS} from './tweens';
import {registerValueShadows, valueShadowExtension} from './valueShadow';

/** Fixed in place: the page has one tween, and it is this. */
const tweenHeadExtension = defineExtension(`${TWEEN_HEAD}_init`, {
  extension() {
    const block = this as unknown as Blockly.BlockSvg;
    block.setMovable(false);
    block.setDeletable(false);
    block.hat = 'cap';
  },
});

export const tweenHead = defineBlock({
  type: TWEEN_HEAD,
  message0: '%1 over %2 seconds, %3',
  args0: [
    {type: 'field_label_serializable', name: 'NAME', text: ''},
    {type: 'input_value', name: 'SECONDS', check: 'Number'},
    {type: 'field_dropdown', name: 'CURVE', options: CURVE_OPTIONS},
  ],
  inputsInline: true,
  nextStatement: true,
  extensions: [tweenHeadExtension, valueShadowExtension],
  style: 'setup_blocks',
  tooltip:
    'A movement over time. Each `set` below it is where the property ends ' +
    'up, from wherever it is when the tween is played.',
  generator: {
    javascript: () => '',
  },
});

// A second, not nothing: a tween of no length lands the frame it starts,
// which looks like a tween that did not run.
registerValueShadows(TWEEN_HEAD, [
  {name: 'SECONDS', shadow: {type: 'math_number', fields: {NUM: 1}}},
]);
