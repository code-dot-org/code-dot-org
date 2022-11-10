function addOneBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newBlockObj = {
        blockName: 'addOne',
        input: input
      };
      addFunctionBlock(newBlockObj);
    }
    input = input + 1;
    output = input;
}