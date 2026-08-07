// `define block` — designing the block a rule adds to the palette.
//
// `define action` and `define query` name a member in a text field and grow
// parameter rows beneath it, so the block a learner will actually USE is never
// shown until they go and find it in the toolbox. Two things follow from that,
// and both are the reason this exists: the definition does not look like the
// thing it defines, and a rule's implementation is hard to scan, because
// "where is `nudge` defined?" means reading NAME fields down a column.
//
// So the definition renders its own block, in place, above the body:
//
//     define block  ⟨reports a number ▾⟩
//     push  [amount]  toward  [target]
//     do …
//
// That row is what the call site will look like, built from the same parts, so
// designing the block IS seeing it. A learner scanning a rule sees the blocks it
// makes, not a list of names.
//
// THE PARTS. A signature is an ordered list of labels and parameters — the same
// shape Blockly's own `message0` has, which is not a coincidence: `push %1
// toward %2` is exactly "label, param, label, param". Naming a member is just
// the case where the list is one label.
//
// THE EDITOR is the familiar mutator bubble — the ⚙ opens a mini-workspace
// holding a `block` container, and the flyout offers a `text` item and one item
// per parameter type. The stack inside the container IS the signature, read
// top-to-bottom as the block reads left-to-right: drag a type in to add an
// input, drag a `text` in to add wording, reorder by reordering statements,
// remove by dragging out.
//
// That is worth the indirection because it is all Blockly's own machinery —
// connecting, dragging, reordering and deleting statements already work, and
// none of it had to be invented. The preview stays on the block, so the result
// is visible while the bubble is open.
//
// USING a parameter is a drag off the preview: each one is a
// `FieldParamVariable`, which pulls a getter for itself out from under the
// pointer, so the way to read `amount` in the body starts on the word `amount`.

import * as Blockly from 'blockly/core';

import {
  defineExtension,
  defineMutator,
  type Extension,
} from '@code-dot-org/blockly';

import {enumParamType, enumRefOfParamType} from '../enums';
import {FieldBlockPreview} from '../fields/FieldBlockPreview';
import {PARAM_FLAVOURS, paramFlavour} from '../typedVariables';

export const BLOCK_DESIGNER_MUTATOR = 'block_designer_mutator';

/**
 * One piece of a block's signature: fixed wording, or a value it takes.
 *
 * A parameter's `var` is the authority — it is what the body's variable blocks
 * point at, and what survives a rename. `name` is a cache of that variable's
 * name, kept so the bubble has something to show before the variable is bound.
 */
export type BlockPart =
  | {kind: 'label'; text: string}
  | {kind: 'param'; type: string; var: string; name?: string};

/** The designer's serialized state: the signature. */
export interface BlockDesignState {
  parts: BlockPart[];
}

const PREVIEW_INPUT = 'PREVIEW';
/** The bubble's container block and the statement input holding the signature. */
const SIGNATURE_CONTAINER = 'world_signature';
const PARTS_INPUT = 'PARTS';
const TEXT_FIELD = 'TEXT';

/** The item block that edits a part. */
export const itemTypeFor = (part: BlockPart): string => {
  if (part.kind === 'label') {
    return 'world_signature_text';
  }
  // Every enum shares ONE item block; which enum is a field on it, so a new
  // `define choices` needs no new block type.
  return enumRefOfParamType(part.type)
    ? SIGNATURE_CHOICE
    : `world_signature_${part.type}`;
};

/**
 * The parameter type an item block stands for, or undefined if it is a label.
 *
 * Reads the BLOCK, not just its type, because the choice item carries the enum
 * it is typed by in a field.
 */
export const paramTypeOf = (item: {
  type: string;
  getFieldValue: (name: string) => string | null;
}): string | undefined => {
  if (item.type === SIGNATURE_CHOICE) {
    const ref = item.getFieldValue(ENUM_FIELD);
    return ref ? enumParamType(ref) : undefined;
  }
  return PARAM_FLAVOURS.map(flavour => flavour.type).find(
    type => item.type === `world_signature_${type}`,
  );
};

/** The item block a parameter typed by an enum is edited as. */
export const SIGNATURE_CHOICE = 'world_signature_choice';
/** The field on it naming which enum. */
export const ENUM_FIELD = 'ENUM';

/** Every block the mutator's flyout offers, in order. */
export const SIGNATURE_BLOCK_TYPES: string[] = [
  'world_signature_text',
  ...PARAM_FLAVOURS.map(flavour => `world_signature_${flavour.type}`),
  SIGNATURE_CHOICE,
];
/** The one field on the preview row: the drawing of the block being defined. */
const PREVIEW_FIELD = 'DRAWING';

/** The default signature: one label, which is the block's name. */
export const defaultParts = (): BlockPart[] => [
  {kind: 'label', text: 'do something'},
];

/**
 * Whether this definition sits under a `define trait` — which decides whether
 * the block it makes takes a SUBJECT.
 *
 * A member under a trait is asked OF an actor: the generated block gains an
 * `Actor` socket the caller fills (defaulting to `this actor`), and the body's
 * closure receives it as its first argument. A member at rule level has no such
 * socket — every actor it works on is a parameter its author put in the
 * signature. Placement decides it, so the preview has to read placement too.
 */
export const isActorScoped = (block: {
  type?: string;
  getRootBlock?: () => {type?: string} | null;
}): boolean => block.getRootBlock?.()?.type === 'world_rule_trait';

/** The wording a signature reads as, for a name (labels joined). */
export const partsName = (parts: readonly BlockPart[]): string =>
  parts
    .filter(
      (part): part is {kind: 'label'; text: string} => part.kind === 'label',
    )
    .map(part => part.text.trim())
    .filter(Boolean)
    .join(' ');

/**
 * The designer, as a mixin two mutators share.
 *
 * `define block` designs a block with any kind of input; `define event` designs
 * one whose inputs can only be CHOICES, because an event's argument is a filter
 * and a filter over "any number" is a comparison rather than a hat. Same
 * machinery, same preview, different flyout — which is all `defineMutator`'s
 * `blocks` is.
 */
const designerMutator = (name: string, blocks: string[]) =>
  defineMutator(
    name,
    {
      // Per-instance; NOT a mixin property, which would share one array across
      // every block. The init extension and loadExtraState seed it.
      parts_: [] as BlockPart[],

      saveExtraState: function (): BlockDesignState {
        return {
          parts: (this.parts_ ?? []).map(part => ({...part})),
        };
      },

      loadExtraState: function (state: BlockDesignState): void {
        this.parts_ = (state.parts ?? []).map(part => ({...part}));
        this.rebuildDesign_();
      },

      designWorkspace_: function (): Blockly.Workspace {
        return this.workspace as unknown as Blockly.Workspace;
      },

      rebuildDesign_: function (): void {
        this.parts_ ??= [];
        if (this.parts_.length === 0) {
          this.parts_ = defaultParts();
        }
        // The headless generator loads `.rule` files into an offscreen workspace
        // whose renderer cannot draw a field. It needs the part DATA and the `DO`
        // body, never this chrome — and rendering there corrupts codegen.
        if ((this.workspace as {isRuleGenerator?: boolean}).isRuleGenerator) {
          return;
        }
        // An insertion marker is a throwaway copy of this block, made and unmade
        // on every drag frame — it is drawn as an outline, so the drawing would
        // never be seen, and building one means standing up and tearing down a
        // whole workspace per frame.
        if (this.isInsertionMarker?.()) {
          return;
        }
        // Variables first, and NOT silently: a rename has to reach the body's
        // variable fields, which happens through the events it fires.
        this.bindParts_();
        // The shape, silently: mutating inputs fires change events the editor
        // persists, which would re-init the block and loop. The one event a real
        // edit fires is the mutation Blockly's own mutator machinery wraps
        // `compose` in.
        const enabled = Blockly.Events.isEnabled();
        if (enabled) {
          Blockly.Events.disable();
        }
        try {
          this.buildDesignShape_();
        } finally {
          if (enabled) {
            Blockly.Events.enable();
          }
        }
      },

      /**
       * Bind every parameter to a variable, creating and renaming to match the
       * names typed in the bubble.
       *
       * A parameter IS a variable — the body reads it with an ordinary getter — so
       * naming one in the bubble has to be a variable rename, which is what makes
       * the name change everywhere the body already uses it.
       *
       * A name is made free of both the workspace's other variables and this
       * signature's earlier parameters: two inputs sharing a name would generate a
       * function with a duplicated argument, which is a syntax error, and one
       * shadowing a rule-level variable would silently cut the body off from it.
       */
      bindParts_: function (): void {
        const map = this.designWorkspace_().getVariableMap();
        const used = new Set<string>();
        for (const part of this.parts_ ?? []) {
          if (part.kind !== 'param') {
            continue;
          }
          const tag = paramFlavour(part.type).type;
          let variable = part.var ? map.getVariableById(part.var) : null;
          // A variable's type is fixed, so a retyped part rebinds rather than
          // carrying a variable of the wrong type into the body's getters.
          if (variable && variable.getType() !== tag) {
            variable = null;
          }
          // The bound variable's own name comes before the type, or a signature
          // saved before names were cached would rename `amount` to `number` on
          // the next rebuild — silently, and everywhere the body uses it.
          const wanted =
            (part.name ?? '').trim() || variable?.getName() || (tag as string);
          const free = (candidate: string): boolean =>
            !used.has(candidate.toLowerCase()) &&
            !map
              .getAllVariables()
              .some(
                other =>
                  other.getId() !== variable?.getId() &&
                  other.getName().toLowerCase() === candidate.toLowerCase(),
              );
          let name = wanted;
          for (let suffix = 2; !free(name); suffix++) {
            name = `${wanted}${suffix}`;
          }
          if (!variable) {
            variable = map.createVariable(name, tag);
          } else if (variable.getName() !== name) {
            map.renameVariable(variable, name);
          }
          used.add(name.toLowerCase());
          part.var = variable.getId();
          part.name = name;
        }
      },

      buildDesignShape_: function (): void {
        // The preview: the call-site block itself, drawn. Not fields spelling out
        // its wording — the block, with its outline, its color and a getter in
        // each socket, so what is designed is what will turn up in the toolbox.
        //
        // The field is made once and re-signed after that. It owns a workspace,
        // and rebuilding it on every edit would mean disposing and re-creating one
        // for each keystroke in the bubble.
        let drawing = this.getField(PREVIEW_FIELD) as FieldBlockPreview | null;
        if (!drawing) {
          drawing = new FieldBlockPreview();
          this.appendDummyInput(PREVIEW_INPUT).appendField(
            drawing,
            PREVIEW_FIELD,
          );
          // Above the body, when there is one. `define event` has none: an
          // event is a declaration, and the blocks that RUN for it live under the
          // hat it makes, in whatever file cares about that event.
          if (this.getInput('DO')) {
            this.moveInputBefore(PREVIEW_INPUT, 'DO');
          }
        }
        drawing.setSignature(
          this.parts_.map(part =>
            part.kind === 'label'
              ? {kind: 'label' as const, text: part.text}
              : {
                  kind: 'param' as const,
                  name: part.name,
                  type: part.type,
                  var: part.var,
                },
          ),
          this.getFieldValue('RETURNS') ?? 'none',
          isActorScoped(this),
          // `define event` designs a HAT, and a hat is a different block: it
          // opens with its subject and picks its choices rather than taking
          // them through sockets.
          this.type === 'world_rule_event' ? 'event' : 'block',
        );
      },

      /**
       * Build the bubble's contents from the current signature.
       *
       * Each part becomes its item block, connected in order. A parameter's item
       * carries its variable id on the block (`varId_`), the way Blockly's own
       * mutators carry a saved connection — so a part dragged out and back keeps
       * the variable the body already reads, rather than becoming a new one.
       */
      decompose: function (workspace: Blockly.Workspace) {
        const container = workspace.newBlock(SIGNATURE_CONTAINER);
        (container as Blockly.BlockSvg).initSvg?.();
        let connection = container.getInput(PARTS_INPUT)?.connection ?? null;
        for (const part of this.parts_ ?? []) {
          const item = workspace.newBlock(itemTypeFor(part));
          (item as Blockly.BlockSvg).initSvg?.();
          if (part.kind === 'label') {
            item.setFieldValue(part.text, TEXT_FIELD);
          } else {
            // Which enum, before the name: the choice item's dropdown is what
            // makes it this parameter rather than a differently-typed one, and a
            // part reopened in the bubble has to come back as what it was.
            const choice = enumRefOfParamType(part.type);
            if (choice) {
              item.setFieldValue(choice, ENUM_FIELD);
            }
            item.setFieldValue(part.name ?? part.type, TEXT_FIELD);
            (item as {varId_?: string}).varId_ = part.var;
          }
          connection?.connect(item.previousConnection!);
          connection = item.nextConnection;
        }
        return container;
      },

      /** Read the stack back out as the signature. */
      compose: function (container: Blockly.Block) {
        const parts: BlockPart[] = [];
        let item = container.getInput(PARTS_INPUT)?.connection?.targetBlock();
        while (item) {
          const param = paramTypeOf(item);
          if (param) {
            parts.push({
              kind: 'param',
              type: param,
              // Kept from `decompose` when this item was already in the signature;
              // empty for one just dragged in, which the rebuild binds afresh.
              var: (item as {varId_?: string}).varId_ ?? '',
              name: item.getFieldValue(TEXT_FIELD) ?? '',
            });
          } else {
            parts.push({
              kind: 'label',
              text: item.getFieldValue(TEXT_FIELD) ?? '',
            });
          }
          item = item.getNextBlock();
        }
        // Never nothing: a block with no parts has no name and no shape.
        this.parts_ = parts.length > 0 ? parts : defaultParts();
        this.rebuildDesign_();
      },
    },
    // The bubble's flyout — what may go into a signature.
    {blocks},
  );

export const blockDesignerMutator = designerMutator(
  BLOCK_DESIGNER_MUTATOR,
  SIGNATURE_BLOCK_TYPES,
);

/** The name the event designer registers under (`define event`'s mutator). */
export const EVENT_DESIGNER_MUTATOR = 'event_designer_mutator';

/**
 * The same designer for an event's phrasing — wording and choices only.
 *
 * An event's parameter is a FILTER: the hat runs when what was emitted matches
 * it. That is a question with an answer for a named set of choices ("when
 * ⟨space⟩ is pressed") and not one for a number or a vector, so those items are
 * not offered rather than being offered and quietly ignored.
 */
export const eventDesignerMutator = designerMutator(EVENT_DESIGNER_MUTATOR, [
  'world_signature_text',
  SIGNATURE_CHOICE,
]);

export const BLOCK_DESIGNER_INIT_EXTENSION = 'block_designer_init';

/**
 * Seed a fresh block's signature, and redraw it when `RETURNS` decides.
 *
 * A block dragged from the toolbox has no `extraState`, so `loadExtraState`
 * never runs; without this it would render with no parts at all.
 *
 * Two redraws, for two different reasons, and both are about `RETURNS` — which
 * decides whether the drawing stacks or plugs in, the most visible thing about
 * the block being designed:
 *
 *   • A CHANGE to it. It is a plain dropdown; nothing else would notice.
 *   • FINISHED_LOADING. Blockly's serializer applies `extraState` BEFORE fields,
 *     so the shape built during `loadExtraState` was drawn against the dropdown's
 *     default — every query in a saved file drew as an action until this.
 */
export const blockDesignerInitExtension: Extension = defineExtension(
  BLOCK_DESIGNER_INIT_EXTENSION,
  {
    extension() {
      const block = this as unknown as Blockly.Block & {
        parts_?: BlockPart[];
        rebuildDesign_: () => void;
      };
      block.parts_ ??= defaultParts();
      block.rebuildDesign_();
      let wasActorScoped = isActorScoped(block);
      block.setOnChange(event => {
        const changedReturns =
          event.type === Blockly.Events.BLOCK_CHANGE &&
          (event as Blockly.Events.BlockChange).blockId === block.id &&
          (event as Blockly.Events.BlockChange).name === 'RETURNS';
        // Dragging the definition under a trait (or out of one) changes what
        // the block it makes looks like — it gains or loses the subject socket
        // — so the drawing has to follow. Compared rather than rebuilt on every
        // move: a definition is dragged around plenty without changing owner.
        const nowActorScoped = isActorScoped(block);
        const changedOwner = nowActorScoped !== wasActorScoped;
        wasActorScoped = nowActorScoped;
        if (
          changedReturns ||
          changedOwner ||
          event.type === Blockly.Events.FINISHED_LOADING
        ) {
          block.rebuildDesign_();
        }
      });
    },
  },
);
