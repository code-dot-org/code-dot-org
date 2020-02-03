//returns the first and last items in the string
function firstLast(str){
  return str.substring(0,1) + str.substring(str.length-1,str.length);
}

//returns every other item in a string, starting with the first position
function everyOtherOdd(str){
  var temp = "";
  for(var i=0; i< str.length; i++){
    if(i%2===0){
      temp+=str[i];
    }
  }
  return temp;
}

//returns every other item in a string, starting with the second position
function everyOtherEven(str){
  var temp = "";
  for(var i=0; i< str.length; i++){
    if(i%2===1){
      temp+=str[i];
    }
  }
  return temp;
}

//checks if a single letter is a vowel
function isVowel(str){
  var vowelLower = str.toLowerCase();
  var vowelList = ["a", "e", "i", "o", "u"];
  for(var i=0; i<vowelList.length; i++){
    if(vowelList[i]==vowelLower){
      return true;
    }
  }
  return false;
}

//returns all vowels in a string
function vowels(str){
  var vowelsLower = str.toLowerCase();
  var temp = "";
  for(var i=0; i<vowelsLower.length; i++){
    if(isVowel(vowelsLower[i]) === true){
      temp += vowelsLower[i];
    }
  }
  return temp;
}

//returns all consonants in a string
function consonants(str){
  var consoLower = str.toLowerCase();
  var temp = "";
  for(var i=0; i<consoLower.length; i++){
    if(isVowel(consoLower[i]) === false){
      temp += consoLower[i];
    }
  }
  return temp;
}

//turns a string into a list
function makeList(str, separator){
  var tempList = [];
  var tempWord = "";
  for(var i=0; i<str.length; i++){
    if(str[i]== separator){
      appendItem(tempList, tempWord);
      tempWord = "";
    } else {
      tempWord += str[i];
    }
  }
  appendItem(tempList, tempWord);
  return tempList;
}

//turns a list into a string
function join(list, combiner){
  var temp = "";
  for(var i=0; i<list.length; i++){
    temp+= (list[i] + combiner);
  }
  return temp;
}

//returns every other word starting with the first one
function everyOtherWordOdd(str){
  var tempList = makeList(str, " ");
  var newList = [];
  for(var i=0; i<tempList.length; i++){
    if(i%2 === 0){
      appendItem(newList, tempList[i]);
    }
  }
  return join(newList, " ");
}
//returns every other word starting with the second one
function everyOtherWordEven(str){
  var tempList = makeList(str, " ");
  var newList = [];
  for(var i=0; i<tempList.length; i++){
    if(i%2 == 1){
      appendItem(newList, tempList[i]);
    }
  }
  return join(newList, " ");
}

//returns a string with all instances of a letter or symbol removed
function remove(str, remover){
  var temp = "";
  for(var i=0; i<str.length; i++){
    if(str[i]!= remover){
      temp += str[i];
    }
  }
  return temp;
}

//returns a single word converted to Pig Latin
function pigLatin(str){
  var firstLetter = str.substring(0,1).toLowerCase();
  var secondLetter = str.substring(1,2).toLowerCase();
  if(isVowel(firstLetter)){
    return str + "ay";
  } else if(firstLetter == "t" && secondLetter == "h"){
    if(str.substring(2,3)=="e"){
      return "the";
    }
    return str.substring(2, str.length) + "th" + "ay";
  } else if(firstLetter == "s" && secondLetter == "t"){
    return str.substring(2, str.length) + "st" + "ay";
  } else if(firstLetter == "b" && secondLetter == "r"){
    return str.substring(2, str.length) + "br" + "ay";
  } else if(firstLetter == "c" && secondLetter == "h"){
    return str.substring(2, str.length) + "ch" + "ay";
  } else {
    var remainingWord = str.substring(1,str.length);
    return remainingWord + firstLetter + "ay";
  }
}

//takes a string with words separated by spaces and returns it in Pig Latin
function pigLatinStory(str){
  var tempList = makeList(str, " ");
  for(var i=0; i<tempList.length; i++){
    if(tempList[i].length > 2){
      tempList[i] = pigLatin(tempList[i]);
    }
  }
  return join(tempList, " ");
}