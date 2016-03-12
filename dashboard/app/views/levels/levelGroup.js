/* global levelCount */

window.getResult = function()
{
  // Construct an array of all the level results.
  // When submitted it's something like this:
  //
  //   [{"level_id":1977,"result":"0"},{"level_id":2007,"result":"3"},{"level_id":1939,"result":"2,1"}]
  //

  var attemptArray = [];
  for (var i = 0; i < levelCount; i++)
  {
    var multiName = "multi_" + i;
    var multiResult = window[multiName].getCurrentAnswer().toString();
    var levelId = window[multiName].getLevelId();
    attemptArray.push({level_id: levelId, result: multiResult});
  }
  var response = JSON.stringify(attemptArray);

  return {
    "response": response,
    "result": true,
    "errorType": null
  };
};
