var colors = {
  Number: [192, 1.00, 0.99], // 00ccff
  string: [180, 1.00, 0.60], // 0099999
  image: [285, 1.00, 0.80], // 9900cc
  boolean: [90, 1.00, 0.4] //336600
};
module.exports.colors = colors;

/**
 * Helper function to create the init section for a functional block
 */
module.exports.initTitledFunctionalBlock = function (block, title, type, args) {
  block.setFunctional(true, {
    headerHeight: 30
  });
  block.setHSV.apply(block, colors[type]);

  var options = {
    fixedSize: { height: 35 }
  };

  block.appendDummyInput()
    .appendTitle(new Blockly.FieldLabel(title, options))
    .setAlign(Blockly.ALIGN_CENTRE);

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    var input = block.appendFunctionalInput(arg.name);
    input.setInline(i > 0);
    input.setHSV.apply(input, colors[arg.type]);
    input.setCheck(arg.type);
    input.setAlign(Blockly.ALIGN_CENTRE);
  }

  block.setFunctionalOutput(true, type);
}
