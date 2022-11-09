function addEightBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newBlockObj = {
        blockName: 'addEight',
        input: input
      };
      addFunctionBlock(newBlockObj);
    }
    input = input + 8;
    output = input;
}