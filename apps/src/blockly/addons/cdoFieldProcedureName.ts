import * as BlocklyCore from 'blockly/core';

import localization from '@cdo/apps/localization';

import {BLOCK_TYPES} from '../constants';
import {
  onRegistryChange,
  translateProcedureName,
} from '../utils/localization/procedureNameRegistry';

/**
 * The NAME field of procedures_callnoreturn and gamelab_behavior_get. Its
 * value is the name as stored, which serialization, procedure lookups and
 * solution checks use; it displays the translation when the level authored
 * the name.
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
