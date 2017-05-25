import { createToolbox } from '../../block_utils';

function craftBlock(type, children = "") {
  return block(`craft_${type}`, children);
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
      category('Agent',
        craftBlock('move') +
        craftBlock('turn') +
        craftBlock('tptoplayer')+
        craftBlock('place') +
        craftBlock('destroy') +
        craftBlock('till') +
        craftBlock('attack') +
        craftBlock('collect') +
        craftBlock('collectall') +
        craftBlock('drop') +
        craftBlock('dropall') +
        craftBlock('detect') +
        craftBlock('inspect') +
        craftBlock('inspectdata') +
        craftBlock('getitemdetail') +
        craftBlock('getitemspace') +
        craftBlock('getitemcount') +
        craftBlock('transfer') +
        craftBlock('detectredstone')) +
      category('Item',
          craftBlock('block') +
          craftBlock('miscellaneous') +
          craftBlock('tool') +
          craftBlock('decoration') +
          craftBlock('getnameof') +
          craftBlock('getdataof') +
          craftBlock('createblock', `<value name='BLOCKTYPE'>${block('text')}</value><value name='BLOCKDATA'>${block('text')}</value>`)) +
      category('Blocks',
        craftBlock('tptotarget') +
        craftBlock('tptopos') +
        craftBlock('fill', `<value name='ITEM'>${craftBlock('block')}</value>`) +
        craftBlock('give') +
        craftBlock('kill') +
        craftBlock('setblock', `<value name='ITEM'>${craftBlock('block')}</value>`) +
        craftBlock('summon') +
        craftBlock('testforblock', `<value name='ITEM'>${craftBlock('block')}</value>`) +
        craftBlock('testforblocks') +
        craftBlock('clone') +
        craftBlock('clonefiltered', `<value name='ITEM'>${craftBlock('block')}</value>`) +
        craftBlock('executeasother') +
        craftBlock('executedetect', `<value name='ITEM'>${craftBlock('block')}</value>`) +
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
