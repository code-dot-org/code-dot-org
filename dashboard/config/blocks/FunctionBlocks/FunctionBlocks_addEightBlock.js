function addEightBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newBlockObj = {
        blockName: 'addEight',
        input: input
      };
      addFunctionBlock(newBlockObj);
    }
    if(typeof output === 'undefined') {
      output = input;
    }
    //This structure makes validation code easier
    input = output;
    output = input + 8;
}