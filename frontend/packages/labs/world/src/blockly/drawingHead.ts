// The block an actor's drawing is written under, on its page
// (specs/DRAWING_PAGE_PLAN.md): "Label is drawn ⟨w⟩ by ⟨h⟩", with the pen
// and the shapes below it.
//
// The sizes are sockets, as `define drawing`'s were: nearly every drawing
// asks the actor how big it is. The page turns the head back into the
// actor's `drawing` (`actors/actorDrawing`), and the compiler loads one from
// the data and writes `defineDrawing` from it (`BlocklyGenerator.actorCode`).

import * as Blockly from 'blockly/core';

import {defineBlock, defineExtension} from '@code-dot-org/blockly';

import {DRAWING_HEAD} from './bodySurfaces';
import {registerValueShadows, valueShadowExtension} from './valueShadow';

/** Fixed in place: the page has one drawing, and it is this. */
const drawingHeadExtension = defineExtension(`${DRAWING_HEAD}_init`, {
  extension() {
    const block = this as unknown as Blockly.BlockSvg;
    block.setMovable(false);
    block.setDeletable(false);
    block.hat = 'cap';
  },
});

export const drawingHead = defineBlock({
  type: DRAWING_HEAD,
  message0: '%1 is drawn %2 by %3',
  args0: [
    {type: 'field_label_serializable', name: 'NAME', text: ''},
    {type: 'input_value', name: 'WIDTH', check: 'Number'},
    {type: 'input_value', name: 'HEIGHT', check: 'Number'},
  ],
  inputsInline: true,
  nextStatement: true,
  extensions: [drawingHeadExtension, valueShadowExtension],
  style: 'sprite_blocks',
  tooltip:
    'What this kind of actor looks like. The size is the picture, and it is ' +
    'also how big the actor is for clicks and collisions. The pen and the ' +
    'shapes go underneath.',
  generator: {
    javascript: () => '',
  },
});

registerValueShadows(DRAWING_HEAD, [
  {name: 'WIDTH', shadow: {type: 'math_number', fields: {NUM: 32}}},
  {name: 'HEIGHT', shadow: {type: 'math_number', fields: {NUM: 32}}},
]);
