import * as BlocklyCore from 'blockly/core';

import localization from '@cdo/apps/localization';

import {BLOCK_TYPES} from '../constants';
import {
  isTranslatable,
  onRegistryChange,
} from '../utils/localization/procedureNameRegistry';

const BEHAVIOR_PREFIX = '[behavior]';

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
    const canonical = (this.getValue() as string | null) ?? '';
    if (!canonical || !isTranslatable(canonical)) {
      return canonical;
    }
    // Behavior names share the same English strings as procedures ("walk",
    // "jump", etc.) but need distinct translator entries because the target
    // wording can differ. Send a prefixed source with an extra label and
    // strip the prefix if the translator kept it; if they dropped it, trust
    // the returned text verbatim.
    if (this.getSourceBlock()?.type === BLOCK_TYPES.behaviorGet) {
      const translated = localization.translate(
        `${BEHAVIOR_PREFIX} ${canonical}`,
        ['blockly-procedure-name', 'blockly-behavior']
      );
      if (translated.startsWith(BEHAVIOR_PREFIX)) {
        return translated.slice(BEHAVIOR_PREFIX.length).trim();
      }
      return translated;
    }
    return localization.translate(canonical, ['blockly-procedure-name']);
  }

  override initView(): void {
    super.initView();
    this.localeListener_ = () => this.forceRerender();
    localization.on('change', this.localeListener_);
    // Pick up names that arrive after this field first rendered — e.g.,
    // flyout/toolbox caller blocks whose definition registers only once the
    // hidden workspace finishes loading.
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
