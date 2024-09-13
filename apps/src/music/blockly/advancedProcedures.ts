import musicI18n from '../locale';

export function installAdvancedProcedures() {
  Blockly.Extensions.unregister('procedure_caller_mutator');
  Blockly.Extensions.unregister('procedure_def_mutator');
  require('@blockly/block-plus-minus');
  // We use the label 'parameter' to align to CSTA standards and our curriculum.
  Blockly.Msg['PROCEDURE_VARIABLE'] = musicI18n.parameter();
}
