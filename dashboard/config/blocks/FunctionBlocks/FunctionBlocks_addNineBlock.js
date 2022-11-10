function addNineBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newBlockObj = {
        blockName: 'addNine',
        input: input
      };
      addFunctionBlock(newBlockObj);
    }
    input = input + 9;
    output = input;
}