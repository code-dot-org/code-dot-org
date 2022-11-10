function addSixBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newBlockObj = {
        blockName: 'addSix',
        input: input
      };
      addFunctionBlock(newBlockObj);
    }
    input = input + 6;
    output = input;
}