import { createToolbox } from '../../block_utils';

function craftBlock(type) {
  return block(`craft_${type}`);
}

function category(name, children, properties = "") {
  return `<category name='${name}' ${properties}>${children}</category>`;
}

function block(type, children = "") {
  return `<block type='${type}'>${children}</block>`;
}

module.exports = {
  custom: {
    requiredBlocks: [],
    freePlay: false,
    disable_variable_editing: false,
    toolbox: createToolbox(
      category('Blocks',
        category('Agent',
          craftBlock('move') +
          craftBlock('inspect') +
          craftBlock('place') +
          craftBlock('turn') +
          craftBlock('till') +
          craftBlock('destroy') +
          craftBlock('collect') +
          craftBlock('drop') +
          craftBlock('dropall') +
          craftBlock('detect') +
          craftBlock('inspect') +
          craftBlock('inspectdata') +
          craftBlock('detectredstone') +
          craftBlock('getitemdetail') +
          craftBlock('getitemspace') +
          craftBlock('getitemcount') +
          craftBlock('transfer') +
          craftBlock('tptoplayer')) +
        craftBlock('tptotarget') +
        craftBlock('tptopos') +
        craftBlock('fill') +
        craftBlock('give') +
        craftBlock('executeasother') +
        craftBlock('executedetect') +
        craftBlock('timesetbyname') +
        craftBlock('timesetbynumber') +
        craftBlock('weather') +
        craftBlock('wait')) +
      category('Logic',
        block('logic_compare') +
        block('logic_operation') +
        block('logic_negate') +
        block('logic_boolean') +
        block('text')) +
      category('Control',
        block('controls_if') +
        block('controls_if', "<mutation else='1'></mutation>") +
        block('controls_for') +
        block('controls_whileUntil') +
        block('controls_repeat_ext', `<value name='TIMES'>${block('math_number', '<field name="NUM">10</field>')}</value>`))+
      category('Variables', "", 'custom="VARIABLE"') +
      category('Functions', "", 'custom="PROCEDURE"') +
      category('Math',
        block('math_number') +
        block('math_arithmetic') +
        block('math_random_int',
          `<value name='FROM'>${block('math_number', '<field name="NUM">1</field>')}<value>` +
          `<value name='TO'>${block('math_number', '<field name="NUM">10</field>')}<value>`))
    )
  }
};
