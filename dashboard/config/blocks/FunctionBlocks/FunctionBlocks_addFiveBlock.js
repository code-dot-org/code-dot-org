function addFiveBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newBlockObj = {
        blockName: 'addFive',
        input: input
      };
      addFunctionBlock(newBlockObj);
    }
    input = input + 5;
    output = input;
}