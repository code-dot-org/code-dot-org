/* Console
 * =====================
 * Written as an immediately invoked function expression 
 * http://benalman.com/news/2010/11/immediately-invoked-function-expression/
 * so that we can properly hid the private functions. The public functions
 * are returned at the bottom. 
 *
 * A console represents a text console that allows the user to print, println,
 * and read an integer using readInt, and read a float using readFloat. These
 * functions pop up prompt dialogs and make sure that the results are actually
 * of the desired type.
 *
 * @author  Jeremy Keeshin    July 9, 2012
 *
 */
Console = (function(){

  function exists(){
      return $("#console").exists();
  }

  function print(ln){
       $("#console").html($("#console").html() + ln);
       $("#console").scrollTop($("#console")[0].scrollHeight);
  }
  
  function println(ln){
      print(ln + "<br/>");
      var scrollTop = $("#console").scrollTop();
  }
  
  function clear(){
      $("#console").html("");
  }

  /* Read a number from the user using JavaScripts prompt function. 
   * We make sure here to check a few things.
   *
   *    1. If the user checks "Prevent this page from creating additional dialogs," we handle
   *       that gracefully, by checking for a loop, and then returning a DEFAULT value.
   *    2. That we can properly parse a number according to the parse function PARSEFN passed in
   *       as a parameter. For floats it is just parseFloat, but for ints it is our special parseInt
   *       which actually does not even allow floats, even they they can properly be parsed as ints.
   *    3. The errorMsgType is a string helping us figure out what to print if it is not of the right
   *       type.
   */
  function readNumber(str, parseFn, errorMsgType){
      var DEFAULT = 0; // If we get into an infinite loop, return DEFAULT.
      var INFINITE_LOOP_CHECK = 100;

      var prompt = str, looping = false, loopCount = 0;
      while(true){
          var result = Console.readLine(prompt, looping);
          result = parseFn(result);

          // Then it was okay.
          if(!isNaN(result)){
            return result;
          }

          if(result == null) return DEFAULT;
          if(loopCount > INFINITE_LOOP_CHECK) return DEFAULT;
          prompt = "That was not " + errorMsgType + ". Please try again. " + str;
          looping = true;
          loopCount++;
     } 
  }

  function readLine(str, looping){
      CHS.log(looping);
      if(typeof looping === "undefined" || !looping){
        print(str);        
      }
      $("#console").css('margin-top', '180px');


      var result = prompt(str);

      $("#console").css('margin-top', '0px');

      if(typeof looping === "undefined" || !looping){
        println(result);
      }
      return result;
  }

  function readBoolean(str){
      return readNumber(str, function(x){
          if(x == null) return NaN;
          x = x.toLowerCase();
          if(x == "true" || x == "yes") return true;
          if(x == "false" || x == "no") return false;
          return NaN;
      }, "a boolean (true/false)");
  }

  /* Read an int with our special parseInt function which doesnt allow floats, even
   * though they are successfully parsed as ints. */
  function readInt(str){
        return readNumber(str, function(x){
          var resultInt = parseInt(x);
          var resultFloat = parseFloat(x);
          // Make sure the value when parsed as both an int and a float are the same
          if(resultInt == resultFloat) return resultInt;
          return NaN
        }, "an integer");
  }

  /* Read a float with our safe helper function. */
  function readFloat(str){
        return readNumber(str, parseFloat, "a float");
  }

  /* Public functions */
  return {
    readLine: readLine,
    readInt: readInt,
    readFloat: readFloat,
    readBoolean: readBoolean,
    println: println,
    print: print,
    clear: clear,
    exists: exists
  };
}());


function print(str){
    Console.print(str);
}

function println(str){
    Console.println(str);
}

function readLine(str){
    return Console.readLine(str);
}

function readInt(str){
    return Console.readInt(str);
}

function readFloat(str){
    return Console.readFloat(str);
}

function readBoolean(str){
    return Console.readBoolean(str);
}