function addFiveBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newEventObj = {
        blockName: 'addTwo',
        input: input
      };
      addFunctionEvent(newEventObj);
    }
    input = input + 5;
    output = input;
}