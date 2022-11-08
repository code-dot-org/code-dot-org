function addSixBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newEventObj = {
        blockName: 'addTwo',
        input: input
      };
      addFunctionEvent(newEventObj);
    }
    input = input + 6;
    output = input;
}