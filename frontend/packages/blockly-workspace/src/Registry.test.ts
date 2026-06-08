import * as Blockly from 'blockly/core';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {defineExtension} from './extensions/defineExtension';
import {defineMixin} from './mixins/defineMixin';
import {defineMutator} from './mutators/defineMutator';
import {PluginType} from './plugins';
import type {InjectPlugin, FieldPlugin, GlobalPlugin} from './plugins';
import Registry from './Registry';
import type {BlockDefinition, OldBlockDefinition} from './types';

/*
 * Registry's job is bookkeeping against Blockly's global registries
 * (Blockly.Extensions and the FIELD registry) plus its own inject-instance map —
 * none of which needs a rendered workspace, so these run in jsdom. afterEach
 * calls unregisterAll to undo every registration and keep the shared registries
 * clean between tests.
 */

// A field implementation to register; only `fromJson` is needed to be registrable.
class StubField extends Blockly.FieldLabel {
  static fromJson(options: {text?: string}) {
    return new StubField(options.text ?? '');
  }
}

// An inject plugin records each construction and whether it was disposed, so the
// registry's instance tracking and teardown can be observed without a workspace.
class StubInjectPlugin {
  static built: StubInjectPlugin[] = [];
  disposed = false;
  constructor(_workspace: Blockly.WorkspaceSvg, _theme: unknown) {
    StubInjectPlugin.built.push(this);
  }
  dispose() {
    this.disposed = true;
  }
}

const FIELD_NAME = 'registry_test_field';
const MUTATOR_NAME = 'registry_test_mutator';
const EXTENSION_NAME = 'registry_test_extension';
const MIXIN_NAME = 'registry_test_mixin';

const fieldPlugin: FieldPlugin = {
  type: PluginType.Field,
  name: FIELD_NAME,
  field: StubField as unknown as Blockly.fieldRegistry.RegistrableField,
};

const mutator = defineMutator(MUTATOR_NAME, {});
const extension = defineExtension(EXTENSION_NAME, {extension: () => {}});
const mixin = defineMixin(MIXIN_NAME, {helper() {}});

const injectPlugin: InjectPlugin = {
  type: PluginType.Inject,
  plugin: StubInjectPlugin,
};

// A global plugin whose initialize/uninitialize calls are counted, so the
// registry running them at register/unregister time can be observed.
let globalInitialized = 0;
let globalUninitialized = 0;
const globalPlugin: GlobalPlugin = {
  type: PluginType.Global,
  initialize: () => {
    globalInitialized += 1;
  },
  uninitialize: () => {
    globalUninitialized += 1;
  },
};

let registry: Registry;

beforeEach(() => {
  StubInjectPlugin.built = [];
  globalInitialized = 0;
  globalUninitialized = 0;
  // No renderer argument: exercises the ThrasosRenderer default.
  registry = new Registry();
});

afterEach(() => {
  registry.unregisterAll();
});

describe('registerFromBlockDefinition', () => {
  it('registers field/mutator/extension/mixin and rewrites them to names', () => {
    const definition = {
      type: 'registry_test_block',
      tooltip: '',
      message0: '%1',
      args0: [{type: fieldPlugin, name: 'FIELD'}],
      mutator,
      extensions: [extension],
      mixins: [mixin],
    } as unknown as BlockDefinition;

    const block = registry.registerFromBlockDefinition(definition);

    // The plugin references are replaced by the registered names...
    expect((block.args0 as {type: string}[])[0].type).toBe(FIELD_NAME);
    expect(block.mutator).toBe(MUTATOR_NAME);
    expect(block.extensions).toEqual([EXTENSION_NAME, MIXIN_NAME]);

    // ...and each is actually registered with Blockly.
    expect(
      Blockly.registry.hasItem(Blockly.registry.Type.FIELD, FIELD_NAME),
    ).toBe(true);
    expect(Blockly.Extensions.isRegistered(MUTATOR_NAME)).toBe(true);
    expect(Blockly.Extensions.isRegistered(EXTENSION_NAME)).toBe(true);
    expect(Blockly.Extensions.isRegistered(MIXIN_NAME)).toBe(true);
  });

  it('assigns the blank mutator when a block defines none', () => {
    const definition = {
      type: 'registry_test_block_plain',
      tooltip: '',
      message0: 'plain',
    } as unknown as BlockDefinition;

    const block = registry.registerFromBlockDefinition(definition);

    expect(block.mutator).toBe('blank');
    expect(Blockly.Extensions.isRegistered('blank')).toBe(true);
  });

  it('passes old-style (init) definitions through untouched', () => {
    const definition = {
      type: 'registry_test_old',
      init() {},
    } as unknown as OldBlockDefinition;

    const block = registry.registerFromBlockDefinition(definition);

    expect(block.type).toBe('registry_test_old');
    expect(block.mutator).toBeUndefined();
  });
});

describe('inject plugins', () => {
  it('constructs an instance per workspace and disposes it on disposeInject', () => {
    const workspace = {} as Blockly.WorkspaceSvg;

    registry.register(injectPlugin, false, workspace);
    expect(StubInjectPlugin.built).toHaveLength(1);
    expect(StubInjectPlugin.built[0].disposed).toBe(false);

    registry.disposeInject(workspace);
    expect(StubInjectPlugin.built[0].disposed).toBe(true);

    // The workspace entry is gone, so a second disposeInject is a no-op.
    registry.disposeInject(workspace);
    expect(StubInjectPlugin.built).toHaveLength(1);
  });

  it('skips inline workspaces unless the plugin opts in with useWithInline', () => {
    const workspace = {} as Blockly.WorkspaceSvg;

    // inline + not opted in -> skipped
    registry.register({...injectPlugin, useWithInline: false}, true, workspace);
    expect(StubInjectPlugin.built).toHaveLength(0);

    // not inline -> constructed
    registry.register(injectPlugin, false, workspace);
    expect(StubInjectPlugin.built).toHaveLength(1);
  });

  it('requires a workspace; an inject plugin without one is not constructed', () => {
    registry.register(injectPlugin, false /* no workspace */);
    expect(StubInjectPlugin.built).toHaveLength(0);
  });

  it('disposes any remaining inject instances on unregisterAll', () => {
    const workspace = {} as Blockly.WorkspaceSvg;
    registry.register(injectPlugin, false, workspace);

    registry.unregisterAll();

    expect(StubInjectPlugin.built[0].disposed).toBe(true);
  });
});

describe('global plugins', () => {
  it('initializes on register and uninitializes on unregisterAll', () => {
    registry.register(globalPlugin);
    expect(globalInitialized).toBe(1);
    expect(globalUninitialized).toBe(0);

    registry.unregisterAll();
    expect(globalUninitialized).toBe(1);
  });
});

describe('unregisterAll', () => {
  it('unregisters every tracked plugin kind in one pass', () => {
    registry.register(globalPlugin);
    const definition = {
      type: 'registry_test_block',
      tooltip: '',
      args0: [{type: fieldPlugin, name: 'FIELD'}],
      mutator,
      extensions: [extension],
      mixins: [mixin],
    } as unknown as BlockDefinition;
    registry.registerFromBlockDefinition(definition);

    registry.unregisterAll();

    // The field and the global both live in this.registered; iterating a copy
    // ensures neither is skipped by unregister()'s splice. The mutator is now
    // tracked, and the field's guard checks the registry it actually lives in.
    expect(
      Blockly.registry.hasItem(Blockly.registry.Type.FIELD, FIELD_NAME),
    ).toBe(false);
    expect(globalUninitialized).toBe(1);
    expect(Blockly.Extensions.isRegistered(MUTATOR_NAME)).toBe(false);
    expect(Blockly.Extensions.isRegistered(EXTENSION_NAME)).toBe(false);
    expect(Blockly.Extensions.isRegistered(MIXIN_NAME)).toBe(false);
  });
});
