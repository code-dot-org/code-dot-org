import * as BlocklyCore from 'blockly/core';

import localization from '@cdo/apps/localization';

import {BLOCK_TYPES} from '../constants';
import {
  onRegistryChange,
  translateProcedureName,
} from '../utils/localization/procedureNameRegistry';

/**
 * Holds the canonical (author-given) procedure or behavior name as its value,
 * while rendering a translated form when the name is registered as
 * translatable. Used by procedures_callnoreturn and behavior_get for their
 * NAME field so that:
 *   - serialization (extraState, saveExtraState) sees only the canonical name
 *   - getProcedureModel / findProcedureModel_ lookups key on the canonical name
 *   - level solution-matching still compares canonical strings
 *   - the student sees a translated label when the curriculum declares one
 *
 * FieldLabel semantics are preserved: the field is not serializable on its own
 * (the block's extraState carries the name), and setFieldValue('NAME', x) still
 * stores x as-is.
 */
export default class CdoFieldProcedureName extends BlocklyCore.FieldLabel {
  private localeListener_?: () => void;
  private registryUnsubscribe_?: () => void;

  protected override getDisplayText_(): string {
    return translateProcedureName(
      (this.getValue() as string | null) ?? '',
      this.getSourceBlock()?.type === BLOCK_TYPES.behaviorGet
    );
  }

  override initView(): void {
    super.initView();
    this.localeListener_ = () => this.forceRerender();
    localization.on('change', this.localeListener_);
    // The toolbox renders at inject, before the level's names are set.
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
