// A plus/minus mutator for `define action` / `define query`: the parameters an
// action or query takes. A `+` appends a `parameter <name> <type>` row on the
// block; each row's `−` removes it. Params are the flavour of typed Blockly
// variable the mutator manages, so the body reads a param with the matching
// typed getter (the same identifier the closure signature is built from) — no
// parameter block pollutes the toolbox. Modelled on music lab's plus/minus
// mutator (`playMultiMutator`), which is the shape our Blockly wrapper wires.

import * as Blockly from 'blockly/core';

import {
  defineExtension,
  defineMutator,
  type Extension,
} from '@code-dot-org/blockly';

import {PARAM_TYPE_OPTIONS, paramFlavour} from '../typedVariables';

export const RULE_PARAMS_MUTATOR = 'rule_params_mutator';

// The +/- glyphs (shared with the design-system style; copied from music lab).
const PLUS_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
  '9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMT' +
  'ggMTBoLTR2LTRjMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAybC4wNzEgNGgtNC4wNz' +
  'FjLTEuMTA0IDAtMiAuODk2LTIgMnMuODk2IDIgMiAybDQuMDcxLS4wNzEtLjA3MSA0LjA3MW' +
  'MwIDEuMTA0Ljg5NiAyIDIgMnMyLS44OTYgMi0ydi00LjA3MWw0IC4wNzFjMS4xMDQgMCAyLS' +
  '44OTYgMi0ycy0uODk2LTItMi0yeiIgZmlsbD0id2hpdGUiIC8+PC9zdmc+Cg==';
const MINUS_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAw' +
  'MC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPS' +
  'JNMTggMTFoLTEyYy0xLjEwNCAwLTIgLjg5Ni0yIDJzLjg5NiAyIDIgMmgxMmMxLjEwNCAw' +
  'IDItLjg5NiAyLTJzLS44OTYtMi0yLTJ6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K';

/**
 * One parameter's serialized state: its value type and the variable it binds.
 *
 * Exported because it reaches the declaration emit of `DOMAIN_BLOCKS`, whose
 * inferred type includes this mutator's.
 */
export interface ParamState {
  type: string;
  var: string;
}

/** The mutator's serialized extra state — the parameter list in order. */
export interface RuleParamsState {
  params: ParamState[];
}

const PARAM_INPUT = 'PARAM_';
const PLUS_INPUT = 'PLUS';
const VAR_FIELD = 'VAR_';
const TYPE_FIELD = 'TYPE_';
const MINUS_FIELD = 'MINUS_';

export const ruleParamsMutator = defineMutator(RULE_PARAMS_MUTATOR, {
  // Per-instance param list. NOT declared as a mixin property (that would share
  // one array across every block); the init extension / loadExtraState seed it.
  params_: [] as ParamState[],

  saveExtraState: function (): RuleParamsState {
    return {
      params: (this.params_ ?? []).map(p => ({type: p.type, var: p.var})),
    };
  },

  loadExtraState: function (state: RuleParamsState): void {
    this.params_ = (state.params ?? []).map(p => ({type: p.type, var: p.var}));
    this.rebuildParams_();
  },

  // The block's workspace, typed for the variable API (the wrapper's WorkspaceSvg
  // type doesn't surface `createVariable`, but the core one does).
  paramWorkspace_: function (): Blockly.Workspace {
    return this.workspace as unknown as Blockly.Workspace;
  },

  // A fresh, unique variable name for a new parameter.
  freshParamName_: function (): string {
    return Blockly.Variables.generateUniqueName(this.paramWorkspace_());
  },

  // Append a `parameter <var> <type> −` row for each param, then the `+` button.
  // Rebuilt wholesale on any change so row indices and inputs stay consistent;
  // each row's variable binding is restored from `params_[i].var`.
  rebuildParams_: function (): void {
    this.params_ ??= [];
    // The headless code generator loads `.rule` files into an offscreen workspace
    // (tagged `isRuleGenerator`) whose renderer can't draw a field. It needs only
    // the param DATA (`saveExtraState`, set before this runs) and the `DO` body
    // (built by jsonInit), never the +/− chrome — and rendering there corrupts
    // codegen — so skip the visual rebuild. A read-only EDITOR still renders.
    if ((this.workspace as {isRuleGenerator?: boolean}).isRuleGenerator) {
      return;
    }
    // Rebuild the shape SILENTLY: block/field mutations here would otherwise fire
    // change events the editor persists, re-rendering and re-initing the block —
    // an infinite loop. Persistence of a real edit is one explicit mutation event
    // fired by the +/−/type handlers instead. Blockly already suppresses events
    // during load, so this only matters on a re-init.
    const eventsWereEnabled = Blockly.Events.isEnabled();
    if (eventsWereEnabled) {
      Blockly.Events.disable();
    }
    try {
      this.buildParamShape_();
    } finally {
      if (eventsWereEnabled) {
        Blockly.Events.enable();
      }
    }
  },

  // The actual shape build (silent — always run inside disabled events).
  buildParamShape_: function (): void {
    // Remove existing param inputs and the plus button (highest index first).
    for (let i = this.inputList.length - 1; i >= 0; i--) {
      const name = this.inputList[i].name;
      if (name === PLUS_INPUT || name.startsWith(PARAM_INPUT)) {
        this.removeInput(name);
      }
    }
    // The rule authoring blocks' body input is `DO`; params go before it, so
    // insert each row's input ahead of `DO` (falls back to the end).
    this.params_.forEach((param, i) => {
      const tag = paramFlavour(param.type).type;
      // Bind the field to the param's EXISTING variable (by name) — passing null
      // makes FieldVariable create a stray default variable on every rebuild,
      // which re-fires change events and loops. Look up the stored id's name.
      const existing = param.var
        ? this.paramWorkspace_().getVariableMap().getVariableById(param.var)
        : null;
      const input = this.appendDummyInput(PARAM_INPUT + i);
      input
        .appendField(
          new Blockly.FieldImage(MINUS_IMAGE, 18, 18, '−', () =>
            this.removeParam_(i),
          ),
          MINUS_FIELD + i,
        )
        .appendField('parameter')
        .appendField(
          new Blockly.FieldVariable(
            existing ? existing.getName() : null,
            undefined,
            [tag],
            tag,
          ),
          VAR_FIELD + i,
        )
        .appendField(
          new Blockly.FieldDropdown(PARAM_TYPE_OPTIONS, (newType: string) =>
            this.setParamType_(i, newType),
          ),
          TYPE_FIELD + i,
        );
      // Ensure the field points at the stored id, and capture it back so the
      // state and the field agree.
      const field = this.getField(VAR_FIELD + i) as Blockly.FieldVariable;
      if (param.var) {
        field.setValue(param.var);
      }
      param.var = field.getValue() ?? '';
      // Set the type dropdown only when it differs — `setValue` fires its
      // validator (`setParamType_`), so re-setting the same value would loop.
      const typeField = this.getField(TYPE_FIELD + i);
      if (typeField && typeField.getValue() !== param.type) {
        typeField.setValue(param.type);
      }
      this.moveInputBefore(PARAM_INPUT + i, 'DO');
    });
    this.appendDummyInput(PLUS_INPUT).appendField(
      new Blockly.FieldImage(PLUS_IMAGE, 18, 18, '+', () => this.addParam_()),
      PLUS_INPUT,
    );
    this.moveInputBefore(PLUS_INPUT, 'DO');
  },

  // Apply a user edit to the param list: rebuild the (silent) shape, then fire
  // ONE mutation event so the change is recorded (undo) and persisted (the editor
  // re-serializes). `rebuildParams_` fires nothing itself, so this is the only
  // event — no re-render loop.
  changeParams_: function (mutate: () => void): void {
    this.params_ ??= [];
    const oldState = this.saveExtraState();
    mutate();
    this.rebuildParams_();
    Blockly.Events.fire(
      new Blockly.Events.BlockChange(
        this,
        'mutation',
        null,
        oldState,
        this.saveExtraState(),
      ),
    );
  },

  // Add a parameter (a fresh number variable).
  addParam_: function (): void {
    this.changeParams_(() => {
      const type = PARAM_TYPE_OPTIONS[0][1];
      const variable = this.paramWorkspace_()
        .getVariableMap()
        .createVariable(this.freshParamName_(), paramFlavour(type).type);
      (this.params_ ??= []).push({type, var: variable.getId()});
    });
  },

  removeParam_: function (index: number): void {
    this.changeParams_(() => {
      (this.params_ ??= []).splice(index, 1);
    });
  },

  // Change a param's type — bind a fresh variable of the new type (a variable's
  // type is fixed, so retyping rebinds; any getter on the old one must re-pick).
  setParamType_: function (index: number, newType: string): string {
    // No-op when the type is unchanged. `rebuildParams_` re-applies each row's
    // dropdown value with `setValue`, which fires this validator; without this
    // guard that would createVariable + rebuild + setValue again, endlessly.
    if ((this.params_ ?? [])[index]?.type === newType) {
      return newType;
    }
    // Defer: mutating inputs/firing events mid field-validation is unsafe.
    setTimeout(
      () =>
        this.changeParams_(() => {
          const variable = this.paramWorkspace_()
            .getVariableMap()
            .createVariable(this.freshParamName_(), paramFlavour(newType).type);
          (this.params_ ??= [])[index] = {type: newType, var: variable.getId()};
        }),
      0,
    );
    return newType;
  },
});

/**
 * Seed a fresh (unserialized) action/query block with the `+` button. Blockly
 * does not call `loadExtraState` for a new block, so the initial shape — an empty
 * param list showing just `+` — is set up here. Pair with {@link
 * ruleParamsMutator} on the block definition.
 */
export const RULE_PARAMS_INIT_EXTENSION = 'rule_params_init';
export const ruleParamsInitExtension: Extension = defineExtension(
  RULE_PARAMS_INIT_EXTENSION,
  {
    extension() {
      const block = this as unknown as {
        params_?: ParamState[];
        rebuildParams_: () => void;
      };
      block.params_ = block.params_ ?? [];
      block.rebuildParams_();
    },
  },
);
