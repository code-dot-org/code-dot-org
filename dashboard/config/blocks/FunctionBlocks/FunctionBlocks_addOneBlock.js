function addOneBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newBlockObj = {
        blockName: 'addOne',
        input: input
      };
      addFunctionBlock(newBlockObj);
    }
    if(typeof output === 'undefined') {
      output = input;
    }
    //This structure makes validation code easier
    input = output;
    output = input + 1;
}