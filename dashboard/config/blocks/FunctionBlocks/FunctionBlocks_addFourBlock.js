function addFourBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newEventObj = {
        blockName: 'addTwo',
        input: input
      };
      addFunctionEvent(newEventObj);
    }
    input = input + 4;
    output = input;
}