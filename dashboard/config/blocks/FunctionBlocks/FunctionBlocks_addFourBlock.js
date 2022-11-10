function addFourBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newBlockObj = {
        blockName: 'addFour',
        input: input
      };
      addFunctionBlock(newBlockObj);
    }
    input = input + 4;
    output = input;
}