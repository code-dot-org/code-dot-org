// The variable an event hat gives one of its values, drawn as its getter.
//
// A hat owns its values as a `let` owns its name
// (specs/VARIABLE_OWNERSHIP_PLAN.md): each hat makes its own variable for
// each value, so two handlers of one event read two variables. The id is
// saved with the hat; the name is the event's, and follows it. Pressing the
// chip takes out a getter for it, as a member head's sockets do
// (`memberHead`).

import * as Blockly from 'blockly/core';

import {beginGetterDrag} from './dragGetterOut';

interface Config extends Blockly.FieldConfig {
  /** The value's name in the event's signature. */
  local?: string;
  /** The variable type it is read as — `Number`, `Actor`, … */
  variableType?: string;
  /** The getter a press takes out. */
  getterType?: string;
  /** That getter's block style, which the chip is drawn in. */
  chipStyle?: string;
}

export class EventLocalField extends Blockly.Field<string> {
  override SERIALIZABLE = true;
  override EDITABLE = false;

  private readonly local: string;
  private readonly variableType: string;
  private readonly getterType: string;
  private readonly chipStyle: string;

  constructor(config: Config = {}) {
    super('', null, config);
    this.local = config.local ?? '';
    this.variableType = config.variableType ?? '';
    this.getterType = config.getterType ?? '';
    this.chipStyle = config.chipStyle ?? '';
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

  /** The value's name, never the id. */
  protected override getText_(): string {
    const id = this.getValue();
    const variable = id ? this.map()?.getVariableById(id) : null;
    return variable?.getName() ?? this.local;
  }

  override initView(): void {
    super.initView();
    const block = this.getSourceBlock() as Blockly.BlockSvg | null;
    const group = this.fieldGroup_;
    if (!block || !group) {
      return;
    }
    group.classList.add('worldEventLocal');
    group.style.cursor = 'grab';
    // Before the block's own listener: a press here is a getter taken out,
    // not the hat dragged. In the flyout the hat itself is what is taken.
    group.addEventListener('pointerdown', event => {
      const id = this.getValue();
      if (
        block.isInFlyout ||
        block.workspace.isReadOnly() ||
        !id ||
        !this.getterType
      ) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      beginGetterDrag({
        workspace: block.workspace,
        variableId: id,
        getterType: this.getterType,
        event,
      });
    });
  }

  /** Painted as the getter is: its style's colour, its text white. */
  override applyColour(): void {
    const block = this.getSourceBlock() as Blockly.BlockSvg | null;
    const style = block?.workspace.getTheme().blockStyles[this.chipStyle];
    if (this.borderRect_ && style) {
      this.borderRect_.setAttribute('fill', style.colourPrimary);
      this.borderRect_.setAttribute('stroke', style.colourTertiary);
      this.borderRect_.style.fillOpacity = '1';
    }
    if (this.textElement_ && style) {
      this.textElement_.style.fill = '#fff';
    }
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

let registered = false;

/** Register the field, once — see `fields/scopedVariable` for why here. */
export function registerEventLocalField(): void {
  if (registered) {
    return;
  }
  registered = true;
  Blockly.fieldRegistry.register(EVENT_LOCAL_FIELD, EventLocalField as never);
}
