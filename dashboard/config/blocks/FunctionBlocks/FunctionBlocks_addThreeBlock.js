function addThreeBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newBlockObj = {
        blockName: 'addThree',
        input: input
      };
      addFunctionBlock(newBlockObj);
    }
    input = input + 3;
    output = input;
}