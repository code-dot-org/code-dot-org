function addEightBlock() {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newEventObj = {
        blockName: 'addTwo',
        input: input
      };
      addFunctionEvent(newEventObj);
    }
    input = input + 8;
    output = input;
}