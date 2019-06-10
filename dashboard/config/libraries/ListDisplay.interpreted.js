// Joins all elements in a list, split by a seperator
// list {list} - a list of strings or numbers
// seperator {string} - a symbol that will appear between each element
// return {string} - a string of all the original list elements split by the seperator
function joinList(list, seperator){
  var temp = "";
  for(var i=0; i<list.length;i++){
    if(i != list.length-1){
      temp = temp + list[i] + seperator + " ";
    } else {
      temp = temp + list[i];
    }
  }
  return temp;
}

// Transforms a list into a string with each element on a seperate line
// list {list} - a list of strings or numbers
// seperator {string} - a symbol that will appear before each element on a new line
// return {string} - a string that when displayed seperates the original list elements on to individual lines
function linedList(list, seperator){
  var temp = "";
  for(var i=0; i<list.length; i++){
    if(i != list.length-1){
      temp = temp + seperator + list[i] + "\n";
    } else {
      temp = temp + seperator + list[i];
    }
  }
  return temp;
}

// Transforms a list into a string with each element on a sepatate numbered line
// list {list} - a list of strings or numbers
// return {string} - a string that when displayed separates the original list elements by numbered lines
function numberedList(list){
  var temp = "";
  for(var i=0; i<list.length; i++){
    if(i != list.length-1){
      temp = temp + (i+1) + ". " + list[i] + "\n";
    } else {
      temp = temp + (i+1) + ". " + list[i];
    }
  }
  return temp;
}

