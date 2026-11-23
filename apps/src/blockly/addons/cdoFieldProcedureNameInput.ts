import * as BlocklyCore from 'blockly/core';

import localization from '@cdo/apps/localization';

import {BLOCK_TYPES} from '../constants';
import {
  onRegistryChange,
  translateProcedureName,
} from '../utils/localization/procedureNameRegistry';

/**
 * The NAME field of a procedure or behavior definition. Its value is the name
 * as stored; it displays, and opens its editor on, the translation the
 * caller blocks show. Committing the translation unchanged keeps the stored
 * name, so opening the editor never renames a curriculum function. Any other
 * text becomes the student's own name, as typed.
 */
export default class CdoFieldProcedureNameInput extends BlocklyCore.FieldTextInput {
  private nameAtEdit_ = '';
  private localeListener_?: () => void;
  private registryUnsubscribe_?: () => void;

  private translated_(name: string): string {
    return translateProcedureName(
      name,
      this.getSourceBlock()?.type === BLOCK_TYPES.behaviorDefinition
    );
  }

  protected override getText_(): string | null {
    const editing = super.getText_();
    if (editing !== null) {
      return editing;
    }
    return this.translated_(String(this.getValue() ?? ''));
  }

  protected override showEditor_(
    e?: Event,
    quietInput?: boolean,
    manageEphemeralFocus?: boolean
  ): void {
    this.nameAtEdit_ = String(this.getValue() ?? '');
    super.showEditor_(e, quietInput, manageEphemeralFocus);
  }

  protected override getEditorText_(value: unknown): string {
    return this.translated_(String(value ?? ''));
  }

  protected override getValueFromEditorText_(text: string): string {
    const name = this.nameAtEdit_;
    if (name && text.trim() === this.translated_(name)) {
      return name;
    }
    return text;
  }

  override initView(): void {
    super.initView();
    this.localeListener_ = () => this.forceRerender();
    localization.on('change', this.localeListener_);
    this.registryUnsubscribe_ = onRegistryChange(() => this.forceRerender());
  }

  override dispose(): void {
    if (this.localeListener_) {
      localization.off('change', this.localeListener_);
      this.localeListener_ = undefined;
    }
    if (this.registryUnsubscribe_) {
      this.registryUnsubscribe_();
      this.registryUnsubscribe_ = undefined;
    }
    super.dispose();
  }
}
