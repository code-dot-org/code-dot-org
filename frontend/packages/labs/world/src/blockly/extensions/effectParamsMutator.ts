// The parameter rows on `add effect`: one value socket per knob the chosen
// effect declares, so `add effect Ripple` can also say *how much* ripple.
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
import {toHex} from '../../engine';
import {COLOUR_CHECK} from '../colorCheck';
import {effectParameters} from '../moduleOptions';

export const EFFECT_PARAMS_MUTATOR = 'effect_params_mutator';

/** One parameter's serialized state — enough to rebuild its row unaided. */
export interface EffectParamState {
  id: string;
  name: string;
  type: EffectParameterType;
  defaultValue: EffectLiteral;
  /**
   * The parameter's declared bounds, when it has them.
   *
   * Recorded alongside the rest because the socket's shadow is chosen from
   * them: a bounded parameter gets a slider, an unbounded one a plain number.
   * A saved workspace is rebuilt from this record before the project registry
   * is guaranteed to be loaded, so the bounds have to travel with it or a
   * reopened file would silently downgrade every slider to a number box.
   */
  min?: number;
  max?: number;
}

/** The mutator's serialized extra state — the parameter list in order. */
export interface EffectParamsState {
  params: EffectParamState[];
}

const PARAM_INPUT = 'EPARAM_';

/**
 * The sockets a parameter type occupies, in order.
 *
 * ONE definition, read by the mutator that builds the sockets and by the
 * generator that reads them back (domainBlocks). They were separate lists that
 * had to agree; now disagreeing is impossible.
 *
 * A scalar is one unlabelled socket. `vec2` is a pair of numbers, because it is
 * a direction or an offset — the effect editor names it x/y. `vec3` and `vec4`
 * are colors by the model's own convention (the editor calls a vec3 "color
 * (RGB)"), so they take a color socket rather than three number boxes: nobody
 * picks a color by typing three floats, and 0.53, 0.27, 0.08 tells a learner
 * nothing about what it looks like.
 *
 * `vec4` takes the SAME single color socket. A picker cannot express alpha, so
 * the shadow it seeds simply means opaque — which is what a learner choosing a
 * color from a swatch expects. Reaching the fourth channel means swapping the
 * picker for the `r g b a` block, which has a slider per channel. That is one
 * socket to understand instead of two, and it keeps alpha where the other
 * channels are rather than orphaned beside them.
 */
export type ParamSocketKind = 'number' | 'boolean' | 'color';

export interface ParamSocket {
  kind: ParamSocketKind;
  /** Shown before the socket; omitted for a parameter's single value. */
  label?: string;
}

const SOCKETS: Record<EffectParameterType, readonly ParamSocket[]> = {
  float: [{kind: 'number'}],
  int: [{kind: 'number'}],
  bool: [{kind: 'boolean'}],
  vec2: [
    {kind: 'number', label: 'x'},
    {kind: 'number', label: 'y'},
  ],
  vec3: [{kind: 'color'}],
  vec4: [{kind: 'color'}],
};

/** The sockets a parameter of this type occupies. */
export const paramSockets = (
  type: EffectParameterType,
): readonly ParamSocket[] => SOCKETS[type] ?? [{kind: 'number'}];

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

/**
 * The state a project parameter contributes to the block.
 *
 * Bounds are carried only when the effect declares BOTH — a half-open range
 * cannot position a thumb, so it is treated as no range at all rather than
 * guessing the missing end.
 */
export const toParamState = (parameter: EffectParameter): EffectParamState => ({
  id: parameter.id,
  name: parameter.name,
  type: parameter.type,
  defaultValue: parameter.defaultValue,
  ...(parameter.min !== undefined && parameter.max !== undefined
    ? {min: parameter.min, max: parameter.max}
    : {}),
});

/**
 * The shadow a numeric socket starts life with.
 *
 * A parameter that declares bounds gets `world_slider`, which shows the range
 * and lets the learner sweep it; one that does not gets the plain
 * `math_number`, because a slider with nothing to bound it is a worse number
 * box rather than a better one. `int` carries `precision: 1`, so its slider
 * lands on whole numbers — that is `FieldNumber`'s own rounding, applied to
 * the dragged value and the typed one alike.
 */
/** The Blockly type check each socket kind accepts. */
const SOCKET_CHECK: Record<ParamSocketKind, string> = {
  number: 'Number',
  boolean: 'Boolean',
  color: COLOUR_CHECK,
};

/**
 * The shadow one socket of a parameter starts life with.
 *
 * A color socket gets Blockly's own `colour_picker`, seeded with the
 * parameter's default converted to hex. Deliberately the stock block rather
 * than one of ours: it outputs `Color`, as do `colour_random` and
 * `colour_blend`, so all of them drop into this socket and the generated call
 * converts whatever arrives (see `WorldLab.rgb`). A bespoke block would have
 * shut that door for no gain.
 *
 * An opacity socket is a 0–1 slider whatever the parameter declares, because
 * that is what the fourth channel means — it is not the effect author's to
 * bound.
 */
export const socketShadow = (
  parameter: EffectParamState,
  socket: ParamSocket,
  socketIndex: number,
): Blockly.serialization.blocks.State => {
  if (socket.kind === 'color') {
    return {
      type: 'colour_picker',
      // `COLOUR` is the picker's own field name — Blockly's, like the block
      // type and the connection check. Setting `COLOR` is silent: the shadow
      // appears holding the picker's built-in red instead of the effect's
      // declared default.
      fields: {COLOUR: toHex(componentsOf(parameter.defaultValue, 3))},
    };
  }
  if (socket.kind === 'boolean') {
    return {
      type: 'logic_boolean',
      fields: {BOOL: component(parameter.defaultValue, 0) ? 'TRUE' : 'FALSE'},
    };
  }
  return numberShadowFor(
    parameter,
    component(parameter.defaultValue, socketIndex),
  );
};

/** The first `count` components of a literal, zero-filled. */
const componentsOf = (
  value: EffectLiteral | undefined,
  count: number,
): number[] =>
  Array.from({length: count}, (_unused, index) => component(value, index));

export const numberShadowFor = (
  parameter: EffectParamState,
  value: number,
): Blockly.serialization.blocks.State =>
  parameter.min !== undefined && parameter.max !== undefined
    ? {
        type: 'world_slider',
        fields: {NUM: value},
        extraState: {
          min: parameter.min,
          max: parameter.max,
          ...(parameter.type === 'int' ? {precision: 1} : {}),
        },
      }
    : {type: 'math_number', fields: {NUM: value}};

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
        const width = paramSockets(parameter.type).length;
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
      const sockets = paramSockets(parameter.type);
      sockets.forEach((socket, socketIndex) => {
        const input = this.appendValueInput(socketName(index, socketIndex));
        // The parameter's own name leads its first row, so a multi-socket knob
        // (a vec2's x/y, a color's swatch and opacity) reads as one group.
        if (socketIndex === 0) {
          input.appendField(parameter.name);
        }
        if (socket.label) {
          input.appendField(socket.label);
        }
        input.setCheck(SOCKET_CHECK[socket.kind]);
        restore(
          input.connection,
          `${parameter.id}:${socketIndex}`,
          socketShadow(parameter, socket, socketIndex),
        );
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
