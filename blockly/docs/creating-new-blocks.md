A new Block consists of three parts. For a new block named `new_block_name`:

1. `Blockly.blocks.new_block_name`: where you define the block init method, configure the block's styling, and define the block's inputs and output contracts.
  * The online [block factory tool](https://blockly-demo.appspot.com/static/apps/blockfactory/index.html) can help you navigate putting together boilerplate for the `init` method. 
  * Example:
    ```
      blockly.Blocks.new_block_name = {
          init: function() {
            this.setHSV(258, 0.35, 0.62);
            this.appendDummyInput().appendTitle(new blockly.FieldImage(skin.downJumpArrow, 15, 15));
            this.setOutput(true, 'Number');
          }
        };
    ```
2. `generator.new_block_name`, AKA `blockly.JavaScript.new_block_name`: where you define the JavaScript code the block should evaluate to
  * You have two options:
    1. Returning a string of JavaScript code like `"Turtle.jumpForward(50, 'block_id_3')"`
    2. Returning an array tuple, [javascript code, order]
      * Order informs the order of operations for evaluation. For a list, see the constants: `blockly.JavaScript.ORDER*`
  * Example:
  ```
  generator.simple_move_length = function () {
    return [3, generator.ORDER_ATOMIC];
  };
  ```
