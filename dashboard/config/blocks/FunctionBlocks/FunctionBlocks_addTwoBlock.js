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
  if(typeof output === 'undefined') {
      output = input;
    }
    //This structure makes validation code easier
    input = output;
    output = input + 2;
}