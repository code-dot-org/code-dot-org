function addTwoBlock() {
  //For Validation
  if(typeof checkValidation === 'function' && checkValidation()) {
    var newEventObj = {
      blockName: 'addTwo',
      input: input
    };
    addFunctionEvent(newEventObj);
  }
  //Function
  input = input + 2;
  output = input;
}