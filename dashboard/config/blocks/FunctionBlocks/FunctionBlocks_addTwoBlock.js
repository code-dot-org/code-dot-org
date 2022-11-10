function addTwoBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newBlockObj = {
        blockName: 'addTwo',
        input: input
      };
      addFunctionBlock(newBlockObj);
    }
  //Function
  input = input + 2;
  output = input;
}