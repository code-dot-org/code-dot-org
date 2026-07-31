// The parameter rows on `use effect`: one value socket per knob the chosen
// effect declares, so `use effect Ripple` can also say *how much* ripple.
//
// Unlike `ruleParamsMutator`, nothing here is learner-authored — there is no
// plus or minus. The row list is *derived* from the selected effect, so the
// block reshapes itself when the EFFECT dropdown changes and otherwise holds
// whatever the saved workspace said. That is the whole reason it is a mutator
// and not a static block: a block's inputs are fixed at definition time, and
// these depend on a file in the project.
//
// The parameter list is still serialized onto the block. It has to be: a saved
// workspace is deserialized before anything guarantees the project registry is
// populated, and a value socket that does not exist yet would drop the value
// plugged into it. Loading rebuilds from the block's own record; picking an
// effect rebuilds from the project.

import * as Blockly from 'blockly/core';

import {
  defineExtension,
  defineMutator,
  type Extension,
} from '@code-dot-org/blockly';

import type {
  EffectLiteral,
  EffectParameter,
  EffectParameterType,
} from '../../effect/model/types';
import {effectParameters} from '../moduleOptions';

export const EFFECT_PARAMS_MUTATOR = 'effect_params_mutator';

/** One parameter's serialized state — enough to rebuild its row unaided. */
export interface EffectParamState {
  id: string;
  name: string;
  type: EffectParameterType;
  defaultValue: EffectLiteral;
}

/** The mutator's serialized extra state — the parameter list in order. */
export interface EffectParamsState {
  params: EffectParamState[];
}

const PARAM_INPUT = 'EPARAM_';

/**
 * The component sockets a parameter type occupies.
 *
 * A scalar is one unlabelled socket. A vector gets one per component, labelled
 * the way the effect editor names them: a `vec3` is "color (RGB)" there, so it
 * reads r/g/b here rather than x/y/z. Colors are 0–1 floats, like everything
 * else a shader parameter carries.
 */
const COMPONENTS: Record<EffectParameterType, readonly string[]> = {
  float: [],
  int: [],
  bool: [],
  vec2: ['x', 'y'],
  vec3: ['red', 'green', 'blue'],
  vec4: ['red', 'green', 'blue', 'alpha'],
};

/** Socket name for a parameter's whole value, or one of its components. */
const socketName = (index: number, component = 0): string =>
  `${PARAM_INPUT}${index}_${component}`;

/** The nth component of a literal, or 0 when the shape does not reach. */
function component(value: EffectLiteral | undefined, index: number): number {
  if (Array.isArray(value)) {
    return typeof value[index] === 'number' ? value[index] : 0;
  }
  return typeof value === 'number' ? value : 0;
}

/** The state a project parameter contributes to the block. */
export const toParamState = (parameter: EffectParameter): EffectParamState => ({
  id: parameter.id,
  name: parameter.name,
  type: parameter.type,
  defaultValue: parameter.defaultValue,
});

export const effectParamsMutator = defineMutator(EFFECT_PARAMS_MUTATOR, {
  // Per-instance list. NOT a mixin property — that would share one array across
  // every block; the init extension and loadExtraState seed it.
  effectParams_: [] as EffectParamState[],
  // The list the CURRENT inputs were built from — how a rebuild knows which
  // parameter each existing socket belongs to. Not serialized: it describes the
  // live shape, which `saveExtraState` already captures as `effectParams_`.
  builtParams_: [] as EffectParamState[],

  saveExtraState: function (): EffectParamsState {
    return {params: [...(this.effectParams_ ?? [])]};
  },

  loadExtraState: function (state: EffectParamsState): void {
    this.effectParams_ = [...(state.params ?? [])];
    this.rebuildEffectParams_();
  },

  /** Re-read the chosen effect's parameters from the project and reshape. */
  syncEffectParams_: function (path: string): void {
    const next = effectParameters(path).map(toParamState);
    const before = this.saveExtraState();
    this.effectParams_ = next;
    this.rebuildEffectParams_();
    // One mutation event, so the reshape is undoable and gets persisted. The
    // rebuild itself is silent (below), so this is the only event fired.
    Blockly.Events.fire(
      new Blockly.Events.BlockChange(
        this,
        'mutation',
        null,
        before,
        this.saveExtraState(),
      ),
    );
  },

  rebuildEffectParams_: function (): void {
    this.effectParams_ ??= [];
    // NOTE: no `isRuleGenerator` carve-out here, unlike `ruleParamsMutator`.
    // That one skips its rebuild in the headless generator workspace because
    // its rows are `+`/`−` FieldImages the offscreen renderer cannot draw, and
    // the rule blocks it serves have no generator — only their serialized state
    // is read. These rows are the opposite on both counts: plain labels and
    // value sockets, and a generator that reads those very sockets through
    // `valueToCode`. Skipping the build here leaves the inputs missing, and
    // loading a saved block then fails with "is missing a(n) EPARAM_0_0
    // connection" before a line of code is generated.
    //
    // Rebuild SILENTLY: input mutations fire change events the editor persists,
    // which re-inits the block and would loop. Real edits fire one explicit
    // mutation event in `syncEffectParams_`.
    const eventsWereEnabled = Blockly.Events.isEnabled();
    if (eventsWereEnabled) {
      Blockly.Events.disable();
    }
    try {
      this.buildEffectParamShape_();
    } finally {
      if (eventsWereEnabled) {
        Blockly.Events.enable();
      }
    }
  },

  buildEffectParamShape_: function (): void {
    // What each socket currently holds, keyed by the PARAMETER it belongs to.
    //
    // A rebuild runs on every block init, deserialization included, so seeding
    // sockets with the parameter's default unconditionally would overwrite the
    // learner's value every time the file was reopened — and, worse, quietly:
    // the block would show the default while the saved value went on driving
    // the shader.
    //
    // Keyed by parameter id, not socket index, because switching effects
    // renumbers the sockets: index-keying would smear one effect's values onto
    // another's unrelated knobs. Re-picking the same effect keeps them.
    const saved = new Map<
      string,
      {
        shadow: Blockly.serialization.blocks.State | null;
        target: Blockly.Block | null;
      }
    >();
    (this.builtParams_ ?? []).forEach(
      (parameter: EffectParamState, index: number) => {
        const width = COMPONENTS[parameter.type]?.length || 1;
        for (let component = 0; component < width; component++) {
          const connection = this.getInput(
            socketName(index, component),
          )?.connection;
          if (connection) {
            saved.set(`${parameter.id}:${component}`, {
              shadow: connection.getShadowState(true),
              target: connection.targetBlock(),
            });
          }
        }
      },
    );
    // Detach real (non-shadow) blocks first: `removeInput` disposes whatever a
    // socket still holds, and a plugged-in getter is the learner's, not ours.
    for (const entry of saved.values()) {
      if (entry.target && !entry.target.isShadow()) {
        entry.target.outputConnection?.disconnect();
      }
    }

    // Drop every existing parameter socket (highest index first, so removal
    // does not shift the ones still to be visited).
    for (let i = this.inputList.length - 1; i >= 0; i--) {
      const name = this.inputList[i].name;
      if (name.startsWith(PARAM_INPUT)) {
        this.removeInput(name);
      }
    }

    /** Give a fresh socket back whatever its parameter held, else the default. */
    const restore = (
      connection: Blockly.Connection | null,
      key: string,
      fallback: Blockly.serialization.blocks.State,
    ): void => {
      if (!connection) {
        return;
      }
      const previous = saved.get(key);
      connection.setShadowState(previous?.shadow ?? fallback);
      const target = previous?.target;
      if (target && !target.isShadow() && target.outputConnection) {
        connection.connect(target.outputConnection);
      }
    };

    this.effectParams_.forEach((parameter, index) => {
      const parts = COMPONENTS[parameter.type] ?? [];
      if (parts.length === 0) {
        const input = this.appendValueInput(socketName(index)).appendField(
          parameter.name,
        );
        const isBool = parameter.type === 'bool';
        input.setCheck(isBool ? 'Boolean' : 'Number');
        restore(
          input.connection,
          `${parameter.id}:0`,
          isBool
            ? {
                type: 'logic_boolean',
                fields: {
                  BOOL: component(parameter.defaultValue, 0) ? 'TRUE' : 'FALSE',
                },
              }
            : {
                type: 'math_number',
                fields: {NUM: component(parameter.defaultValue, 0)},
              },
        );
        return;
      }
      // A vector: one labelled number socket per component. The parameter's own
      // name leads the first row so the group reads as one knob.
      parts.forEach((part, componentIndex) => {
        const input = this.appendValueInput(socketName(index, componentIndex));
        if (componentIndex === 0) {
          input.appendField(parameter.name);
        }
        input.appendField(part);
        input.setCheck('Number');
        restore(input.connection, `${parameter.id}:${componentIndex}`, {
          type: 'math_number',
          fields: {NUM: component(parameter.defaultValue, componentIndex)},
        });
      });
    });

    // The sockets now correspond to this list; the next rebuild reads it to
    // know which parameter each socket belonged to.
    this.builtParams_ = [...this.effectParams_];
  },
});

/**
 * Seed a fresh (unserialized) block. Blockly does not call `loadExtraState` for
 * a new block, so the initial shape — the parameters of whichever effect the
 * dropdown landed on — is set up here, along with the validator that reshapes
 * the block when that dropdown changes.
 *
 * Pair with {@link effectParamsMutator} on the block definition.
 */
export const EFFECT_PARAMS_INIT_EXTENSION = 'effect_params_init';
export const effectParamsInitExtension: Extension = defineExtension(
  EFFECT_PARAMS_INIT_EXTENSION,
  {
    extension() {
      const block = this as unknown as {
        effectParams_?: EffectParamState[];
        rebuildEffectParams_: () => void;
        syncEffectParams_: (path: string) => void;
        getField: (name: string) => Blockly.Field | null;
        getFieldValue: (name: string) => string;
      };

      const field = block.getField('EFFECT');
      field?.setValidator((path: string) => {
        // Defer: mutating inputs while a field is validating is unsafe, and the
        // field has not yet committed the new value when the validator runs.
        // By the time it runs the block may be gone — the headless generator
        // clears its workspace between files — so check before reshaping it.
        setTimeout(() => {
          if (!(this as unknown as {isDisposed(): boolean}).isDisposed()) {
            block.syncEffectParams_(path);
          }
        }, 0);
        return path;
      });

      // A block restored from a workspace already has its list (loadExtraState
      // ran); only a fresh one needs seeding from the project.
      if (block.effectParams_ === undefined) {
        block.effectParams_ = effectParameters(
          block.getFieldValue('EFFECT'),
        ).map(toParamState);
      }
      block.rebuildEffectParams_();
    },
  },
);
