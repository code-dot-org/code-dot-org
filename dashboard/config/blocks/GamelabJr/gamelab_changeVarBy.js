var studentVarToken = false;
var varLog={};

function changeVarBy(varName, value){
  for(var b in window) {
    if(b=="math_random_int") {
      studentVarToken = false;
      console.log("...end list");
    }
    if(studentVarToken && window.hasOwnProperty(b)) {
      //console.log(b);
      varLog[b] = window[b];
    }
    if(b=="playSoundOptions") {
      studentVarToken = true;
      console.log("Student variables:");
    }
  }
  console.log(varLog);
}