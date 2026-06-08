import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {createReactField} from './createReactField';
import type {ReactFieldPreviewContext} from './createReactField';

/*
 * createReactField's preview path draws into an SVG group and only runs when the
 * field renders on a block, so it needs a rendered workspace (headless Chromium).
 * We register a field, put it on a block, and observe renderPreview firing with
 * the field's value and a live SVG element.
 */

Blockly.setLocale(En as unknown as {[key: string]: string});

interface Value {
  label: string;
}

const Editor = () => null;

let container: HTMLDivElement;
let workspace: Blockly.WorkspaceSvg;

beforeEach(() => {
  container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);
  workspace = Blockly.inject(container, {});
});

afterEach(() => {
  workspace.dispose();
  container.remove();
});

describe('createReactField rendering', () => {
  it('calls renderPreview with the field value and SVG element when the block renders', () => {
    const previews: ReactFieldPreviewContext<Value>[] = [];
    const plugin = createReactField<Value>({
      name: 'field_rf_preview',
      defaultValue: {label: 'hi'},
      Editor,
      renderPreview: ctx => previews.push(ctx),
    });

    // Register the field and a block that uses it, then render an instance.
    Blockly.fieldRegistry.register(
      plugin.name,
      plugin.field as Parameters<typeof Blockly.fieldRegistry.register>[1],
    );
    Blockly.defineBlocksWithJsonArray([
      {
        type: 'rf_preview_block',
        message0: '%1',
        args0: [{type: 'field_rf_preview', name: 'F'}],
      },
    ]);

    Blockly.serialization.blocks.append({type: 'rf_preview_block'}, workspace);

    expect(previews.length).toBeGreaterThan(0);
    const last = previews[previews.length - 1];
    expect(last.value).toEqual({label: 'hi'});
    expect(last.element.tagName.toLowerCase()).toBe('g');
  });
});
