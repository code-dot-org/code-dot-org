function addSevenBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newBlockObj = {
        blockName: 'addSeven',
        input: input
      };
      addFunctionBlock(newBlockObj);
    }
    input = input + 7;
    output = input;
}