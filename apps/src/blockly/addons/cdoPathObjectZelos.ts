import * as BlocklyCore from 'blockly/core';

export default class CdoPathObjectZelos extends BlocklyCore.zelos.PathObject {
  // The built-in function also adds a cross-hatch fill pattern to disabled blocks, which we don't want.
  // Overrriding the function here so we can just set the class but not add the fill pattern.
  updateDisabled_(disabled: boolean) {
    this.setClass_('blocklyDisabled', disabled);
  }

  // Uses --text-neutral-primary (design system semantic token) so the stroke is black in light
  // mode and white in dark mode without any explicit theme check.
  updateHighlighted(highlighted: boolean) {
    this.svgPath.style.stroke = highlighted
      ? 'var(--text-neutral-primary)'
      : '';
    this.svgPath.style.strokeWidth = highlighted ? '3px' : '';
  }
}
