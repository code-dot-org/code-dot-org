// The variable an event hat gives one of its values, held by the hat.
//
// A hat owns its values as a `let` owns its name
// (specs/VARIABLE_OWNERSHIP_PLAN.md): each hat makes its own variable for
// each value, so two handlers of one event read two variables. The id is
// saved with the hat; the name is the event's, and follows it.

import * as Blockly from 'blockly/core';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {localsOf} from '../variableScope';

interface Config extends Blockly.FieldConfig {
  /** The value's name in the event's signature. */
  local?: string;
  /** The variable type it is read as — `Number`, `Actor`, … */
  variableType?: string;
}

export class EventLocalField extends Blockly.Field<string> {
  override SERIALIZABLE = true;
  override EDITABLE = false;

  private readonly local: string;
  private readonly variableType: string;

  constructor(config: Config = {}) {
    super('', null, config);
    this.local = config.local ?? '';
    this.variableType = config.variableType ?? '';
  }

  static override fromJson(options: Config): EventLocalField {
    return new EventLocalField(options);
  }

  private map() {
    return this.getSourceBlock()?.workspace.getVariableMap();
  }

  /** The hat's variable for this value, made or renamed to the event's name. */
  override initModel(): void {
    const block = this.getSourceBlock();
    const map = this.map();
    if (!block || !map || block.isInFlyout) {
      return;
    }
    const held = this.getValue() ? map.getVariableById(this.getValue()!) : null;
    if (!held) {
      this.setValue(
        map
          .createVariable(
            this.local,
            this.variableType,
            this.getValue() || undefined,
          )
          .getId(),
      );
      return;
    }
    if (held.getName() !== this.local) {
      map.renameVariable(held, this.local);
    }
  }

  /** The name and type too, when asked, so a paste elsewhere can make it. */
  override saveState(doFullSerialization?: boolean): unknown {
    const id = this.getValue();
    if (!doFullSerialization || !id) {
      return id;
    }
    return {id, name: this.local, type: this.variableType};
  }

  override loadState(state: unknown): void {
    const id =
      state && typeof state === 'object'
        ? (state as {id?: string}).id
        : (state as string | null);
    this.setValue(id ?? '');
    this.initModel();
  }

  protected override doClassValidation_(value?: unknown): string | null {
    return typeof value === 'string' ? value : null;
  }

  override referencesVariables(): boolean {
    return true;
  }
}

/** The name a block's JSON asks for this field by. */
export const EVENT_LOCAL_FIELD = 'field_event_local';

/** The field holding the hat's variable for the value at `at`. */
export const localFieldName = (at: number): string => `LOCAL${at}`;

/** Whether a field of that name holds a hat's value (`variableScope`). */
export const isLocalField = (name: string): boolean => /^LOCAL\d+$/.test(name);

/** The input the value fields sit in. */
export const LOCALS_INPUT = 'LOCALS';

/**
 * One field per value the hat's event carries, in a hidden input of their
 * own: the ids are the hat's business, and its message stays the event's.
 */
export const eventLocalsExtension: Extension = defineExtension(
  'world_event_locals',
  {
    extension() {
      const block = this as unknown as Blockly.Block;
      const locals = localsOf(block.type);
      if (!locals.length) {
        return;
      }
      const input = block.appendDummyInput(LOCALS_INPUT);
      locals.forEach((local, at) => {
        input.appendField(
          new EventLocalField({
            local: local.name,
            variableType: local.type,
          }) as unknown as Blockly.Field,
          localFieldName(at),
        );
      });
      input.setVisible(false);
    },
  },
);

let registered = false;

/** Register the field, once — see `fields/scopedVariable` for why here. */
export function registerEventLocalField(): void {
  if (registered) {
    return;
  }
  registered = true;
  Blockly.fieldRegistry.register(EVENT_LOCAL_FIELD, EventLocalField as never);
}
