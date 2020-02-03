// Takes a list as input. Does not return anything but does
// print to the console the unique values inside the list,
// a count of how many times it shows up, and a histogram
// with ASCII art of those values.

function countUnique(arr) {

  var values = arr.filter(onlyUnique);
  var counts = [];
  
  // Generate a list of zeroes for the count
  // of each value
  for(var i = 0; i < values.length; i++){
    appendItem(counts,0);
  }
  
  // Traverse the original list and update
  // the counts for each
  for(var j = 0; j < arr.length; j++){
    counts[values.indexOf(arr[j])]++;
  }
  
  // Build a table of values and counts
  var table = [];
  
  // Add elements to table
  for(var k = 0; k < values.length; k++){
    table.push({"val":values[k], "count": counts[k]});
  }
  
  // Sort the table by the values
  table.sort(tableValSort);

  // Pad everything correctly
  var longestVal = table.reduce(longestValReduce,0);
  var longestCount = table.reduce(longestCountReduce,0);
  
  var row, val, count, repeatX;
  var padVal = stringRepeater(" ",longestVal);
  var padCount = stringRepeater(" ",longestCount);
  
  // Generates the output to the console.
  console.log("Val | Count");
  for(i = 0; i < table.length; i++){
    row = table[i];
    val = row.val;
    val = pad(padVal, val, true);
    count = row.count;
    repeatX = stringRepeater(String.fromCharCode(9608), Math.floor(100 * count / arr.length));
    count = pad(padCount, count, true);
    console.log(val + ": " + count + " " + repeatX);
  }
  
  // Helper function to pull only unique vlaues
  function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
  }
  
  // Sort function to sort the table by the value name
  function tableValSort(a,b){
    return a.val-b.val;
  }
  
  // Reduce function used to find the longest count value
  function longestCountReduce(acc, curr){
    return Math.max(acc, curr.count.toString().length); 
  }
  
  // Reduce function used to find the longest text value
  function longestValReduce(acc, curr){
    return Math.max(acc, curr.val.toString().length);
  }
  
  // Pad function to help add spaces to console output
  function pad(padString, str, padLeft) {
    if (typeof str === 'undefined') 
      return padString;
    if (padLeft) {
      return (padString + str).slice(-padString.length);
    } else {
      return (str + padString).substring(0, padString.length);
    }
  }
  
  // Helper function used to pad the output
  // to the console.
  function stringRepeater(string, times){
    var final = "";
    for(var i = 0; i < times; i++){
      final += string;
    }
    return final;
  }  
  
}