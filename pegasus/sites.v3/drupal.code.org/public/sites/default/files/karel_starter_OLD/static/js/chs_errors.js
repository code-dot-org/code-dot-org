/*
 * CHS.Error
 * =============================
 * This is written as an IIFE with the following public function:
 *
 * show = function that creates and displays an error message popup
 *      This takes an options dictionary that must have the following fields:
 *          message
 *          lineNumber
 *          info = dictionary with info about the editor 
 *          location (optional) = the element to prepend the error message to
 *          log (optional. default=false) = Boolean of whether to log the error
 */
CHS.Error = (function() {
    var show = function(options) {

        var stack = "";
        if (options.trace != undefined) {
            stack = prettyStackTrace(options.trace);
        }

        options.errorType = errorType(options.message);

        displayPopup({
            line: options.lineNumber,
            originalMessage: options.message,
            simpleMessage: simpleMessage(options),
            progType: options.info.progtype,
            examples: codeExamples({
                errorType: options.errorType, 
                progtype: options.info.progtype,
                objectType: getObjectType(options.message)
            }),
            location: options.location,
            stack: stack
        });

        if (options.log) {
            log({
                msg:options.message,
                lineNumber:options.lineNumber,
                uid:options.info.uid,
                kind:options.info.type,
                obj_id:options.info.id,
                code:CHS.Editor.getCode(),
            });
        }

    };

    var prettyStackTrace = function(trace) {
        var stack = "";
        var num_functions_outside_eval = 0;
        var is_error = false;
        // Look through the trace in reverse order
        for (var i=trace.length-1; i > 0; i--) {
            var fn = trace[i];
            if (fn.substr(0,"start ".length) != "start " && stack.length == 0) {
                // Skip all the functions up to eval
                continue;
            }
            if (fn.indexOf("<anonymous>") == -1) {
                if (num_functions_outside_eval++ >= 1) {
                    // Only show them the functions they called in their anonymous fn
                    // Just show one of them (the function they called)
                    break;
                }
                is_error = true;
            }
            var end_of_line = is_error ? " (error here)" : "<br/>"
            stack = stack + fn.substr(0,fn.indexOf(" ")+1) + end_of_line;
        }
        stack = "//Follow the function trace to find your error:<br/>" + stack;
        return stack;
    }

    var displayPopup = function(options) {
        var $errorPopup = $("#error-popup");
        var $output = $("#output");

        // No error output, return
        if(!$errorPopup.exists() && !$output.exists()) return;

        /*$errorPopup.css("top", $output.offset().top + 70);
        $errorPopup.css("left", $output.offset().left + 15);
        $errorPopup.width($output.width() * .70);*/
        $errorPopup.show();

        $(".line-number").html(": Line " + options.line);
        $(".original-message").html(options.originalMessage);
        $(".simple-message").html(options.simpleMessage);
        $(".error-examples").html(options.examples);
        $(".stack").html(options.stack);

        if (options.stack == "") {
            $(".stack").hide();
        } else {
            $(".stack").show();
        }

        if (options.line == "") {
            $(".line-number").hide();
        } else {
            $(".line-number").show();
        }

        if (options.examples == "") {
            $(".error-examples").hide();
        } else {
            $(".error-examples").show();
        }

        //CHS.Help.format();
        prettyPrint();
    };

    var hide = function() {
        $("#error-popup").hide();
    }

    var log = function(info) {
            console.log("ERROR");
            console.log(info);
            /*CHS.Utils.Ajax.send({
                method: 'log_error',
                app: 'editor',
                data: info,
                success: function(resp){
                    console.log(resp);
                    if(resp.status == "ok"){
                         // TODO
                    }
                }
            });*/
    };

    var codeExamples = function(options) {
        switch (options.errorType) {
            case "UNEXPECTED_CLOSE_PARENS":
                break;
            case "EXPECTED_CLOSE_PARENS":
                return "// Make sure to put conditions in your if statements in between parentheses \
                        \nif (frontIsClear()) {\n    ...\n}\nif (age < 21) {\n    ...\n}";
                break;
            case "REFERENCE_ERROR":
                break;
            case "END_OF_INPUT":
                break;
            case "EXTRA_END_BRACE":
                break;
            case "UNEXPECTED_ELSE":
                return "if (CONDITION) { \n\    //code that runs if CONDITION is true \n\} else { \n\    //code that runs if CONDITION is false \n\}";
            case "UNEXPECTED_COLON":
                if (options.progtype == "karel" || options.progtype == "superkarel") {
                    return "// Correct\nturnLeft();\nputBall();\nmove(); \
                    \n\n//Incorrect\nturnLeft():\nputBall():\nmove():";
                }
                return "// Correct\nturnLeft();\nprintln(\"Hello World\");\nvar age = readInt(\"How old are you?\"); \
                \n\n//Incorrect\nturnLeft():\nprintln(\"Hello World\"):\nvar age = readInt(\"How old are you?\"):";
            case "UNEXPECTED_SEMICOLON":
                return "function newFunctionName() {\n   // When creating a function, don't put a semicolon\n} \
                        \n\nwhile (frontIsClear()) {\n   // No semicolon after a while loop's condition\n} \
                        \n\n// Puts the circle in the middle and at y-coordinate 300\n// Don't put semicolons in the parameters \
                        \nvar top = 300; \
                        \ncircle.setPosition(getWidth()/2, top);";
            case "OBJECT_TYPE_ERROR":
                switch(options.objectType) {
                    case "Circle":
                        return "// Circle Documentation:\n\nvar circle = new Circle(radius);\n\ncircle.getRadius();\ncircle.setPosition(xPos, yPos); \
                                \ncircle.getX();\ncircle.getY();\ncircle.move(dx, dy);";
                    case "Rectangle":
                        return "// Rectangle Documentation:\n\nvar rect = new Rectangle(width, height);\n\nrect.setPosition(xPos, yPos); \
                                \nrect.getX();\nrect.getY();\nrect.move(dx, dy);\nrect.getWidth();\nrect.getHeight();";
                }
                break;
            case "UNEXPECTED_STRING":
                return "var playerName = readLine(\"Player Name: \");\nvar numPoints = readInt(\"Number of Points: \"); \
                    \nvar numRebounds = readInt(\"Number of Rebounds: \"); \
                    \nprintln(playerName + \" scored \" + numPoints + \n   \" points and had \" + numRebounds + \" rebounds.\");";
            case "FOR_LOOP_ERROR":
                return "for (var i=0; var i < COUNT; i++) {\n    //code that gets repeated\n} \
                \n\n//Remember to replace COUNT with an actual number (or variable) like this\nfor (var i=0; var i < 4; i++) {";
        }
        return "";
    };

    var simpleMessage = function(info) {
        var msg = info.message;
        switch (info.errorType) {
            case "UNEXPECTED_CLOSE_PARENS":
                msg = "You might be missing a <span class='code'>(</span> or have an extra <span class='code'>)</span>";
                break;
            case "EXPECTED_CLOSE_PARENS":
                msg = "You are missing a <span class='code'>)</span> somewhere.";
                break;
            case "REFERENCE_ERROR":
                var start = info.message.substr("Uncaught ReferenceError: ".length);
                var firstSpace = start.indexOf(" ");
                var token = start.substr(0, firstSpace);
                var misspelling = commonMisspelling(token);
                if (misspelling != null) {
                    if (token == misspelling) {
                        msg = "<span class='code'>" + token + "();</span> isn't defined in Karel. \
                            You must define it yourself or just use <span class='code'>turnLeft();</span> to do what you want.";
                    } else {
                        msg = "You may have made a typo. You typed <span class='code'>" + token + "</span> \
                             but probably meant <span class='code'>" + misspelling + "</span> - Check your spelling and capitalization.";
                    }
                } else {
                    msg = "<span class='code'>" + token + "</span> is not defined. You may have a typo. Check your spelling and capitalization.";
                }
                break;
            case "END_OF_INPUT":
                msg = "You are probably missing an end bracket } somewhere. Check to make sure every { matches with a }. It helps to use good \
                        indentation style with your code. Look at the command reference for examples.";
                break;
            case "EXTRA_END_BRACE":
                msg = "It looks like you have an extra <span class='code'>}</span>. \
                        Or you might just have an incomplete line somewhere. Make sure all parentheses and brackets are matched up.";
                break;
            case "UNEXPECTED_ELSE":
                msg = "You may have an extra <span class='code'>else</span> in your code. Remember, there is only <span class='code'>if/else</span>. There is no <span class='code'>while/else</span>. \
                        <br/>If you think you need a <span class='code'>while/else</span>, you just need to \
                        put the code after the while loop. If the while loop's condition is not true, it will just start running the code right after it.";
                break;
            case "UNEXPECTED_COLON":
                msg = "You have an extra colon <span class='code'>:</span> on this line. You may have meant to put a semicolon <span class='code'>;</span> instead.";
                break;
            case "UNEXPECTED_SEMICOLON":
                msg = "Are you missing a <span class='code'>)</span>?<br/>You may have an extra semicolon <span class='code'>;</span> on this line.<br/>Remember, if you're creating your own function or \
                starting a while loop, you don't use a semicolon.<br/>Also, if you have a parameter in a function, don't put a semicolon inside \
                the <span class='code'>()</span>";
                break;
            case "OBJECT_TYPE_ERROR":
                var object_type = msg.substr(msg.indexOf("<") + 1, msg.indexOf(">") - msg.indexOf("<") - 1);
                var firstQuote = msg.indexOf("'");
                var secondQuote = msg.indexOf("'", firstQuote+1);
                var token = msg.substr(firstQuote + 1, secondQuote - firstQuote - 1);
                var misspelling = commonMisspelling(token);
                if (misspelling != null) {
                    if (token == misspelling) {
                        msg = "A " + object_type + " object does not have a method named <span class='code'>" + token + "();</span>";
                    } else {
                        msg = "Your object does not have a method named <span class='code'>" + token + "</span> - You may have meant <span class='code'>" 
                                + misspelling + "</span> -- Check your spelling and capitalization.";
                    }
                } else {
                    msg = "Your object does not have a method named <span class='code'>" + token + "</span> - You may have a typo. Check your spelling and capitalization.";
                }
                break;
            case "UNEXPECTED_STRING":
                msg = "You may have a string of text in the wrong place or you forgot a '+' between text and a variable.";
                break;
            case "FOR_LOOP_ERROR":
                msg = "You have an issue with a for-loop. Remember to use semicolons inside the parentheses.";
                break;
            case "UNEXPECTED_&&":
                msg = "Are you missing a <span class='code'>(</span> or <span class='code'>)</span> somewhere?";
                break;
            case "UNEXPECTED_ID":
                msg = "Check the previous line. Are you missing a <span class='code'>(</span> or <span class='code'>)</span> \
                        or <span class='code'>{</span> or <span class='code'>}</span>?";
                break;
            case "UNEXPECTED_NUMBER":
                msg = "You may be missing a comma between your parameters. \
                        <br/>Or, you have an extra space between numbers. \
                        <br/>Remember, you cannot name a function or var starting with a number."
                break;
            default:
                msg = "";
                break;
        }
        return msg;
    };

    var getObjectType = function(message) {
        if (errorType(message) == "OBJECT_TYPE_ERROR") {
            return message.substr(message.indexOf("<") + 1, message.indexOf(">") - message.indexOf("<") - 1);
        }
        return null;
    }
    
    var errorType = function(message) {
        if (message == "Uncaught SyntaxError: Unexpected token )" || 
            message.indexOf("Unexpected token ')'") != -1) {
            return "UNEXPECTED_CLOSE_PARENS";
        }
        if (message.indexOf("Expected token ')'") != -1) {
            return "EXPECTED_CLOSE_PARENS";
        }
        if (message.substr(0,"Uncaught ReferenceError:".length) == "Uncaught ReferenceError:") {
            return "REFERENCE_ERROR";
        }
        if (message.indexOf("Unexpected end of input") != -1) {
            return "END_OF_INPUT";
        }
        if (message.indexOf("Unexpected token }") != -1) {
            return "EXTRA_END_BRACE";
        }
        if (message.indexOf("Unexpected token else") != -1) {
            return "UNEXPECTED_ELSE";
        }
        if (message == "Uncaught SyntaxError: Unexpected token :" ||
            message.indexOf("Unexpected token ':'") != -1) {
            return "UNEXPECTED_COLON";
        }
        if (message == "Uncaught SyntaxError: Unexpected token ;") {
            return "UNEXPECTED_SEMICOLON";
        }
        if (message.indexOf("Uncaught TypeError: Object #") != -1 && message.indexOf("has no method") != -1) {
            return "OBJECT_TYPE_ERROR";
        }
        if (message == "Uncaught SyntaxError: Unexpected string") {
            return "UNEXPECTED_STRING";
        }
        if (message.indexOf("missing ; after for-loop") != -1) {
            return "FOR_LOOP_ERROR";
        }
        if (message.indexOf("Unexpected token &&") != -1) {
            return "UNEXPECTED_&&";
        }
        if (message.indexOf("Unexpected token if") != -1 ||
            message.indexOf("Unexpected token while") != -1 ||
            message.indexOf("Unexpected token for") != -1 ||
            message.indexOf("Unexpected identifier") != -1) {
            return "UNEXPECTED_ID";
        }
        if (message.indexOf("Unexpected number") != -1) {
            return "UNEXPECTED_NUMBER";
        }
    };

    var typos = {
        // Karel Typos
        "putBall": ["putball", "putbal", "putballl", "putbeeper", "putbeepper", "putbeper", "putbepper", "placeball", "dropball"],
        "takeBall": ["pickbeeper", "pickbeper", "pickbepper", "takeball", "takebal", "takeballl", "pickball", "pickupball"],
        "turnLeft": ["turnleft"],
        "turnRight": ["turnright", "turnrihgt"],
        "frontIsClear": ["frontisclear", "frontclear"],
        "frontIsBlocked": ["frontisblocked", "frontisnotclear", "frontisblock"],
        "leftIsClear": ["leftisclear", "leftclear"],
        "leftIsBlocked": ["leftisblocked", "leftisnotclear"],
        "rightIsClear": ["rightisclear", "rightclear"],
        "rightIsBlocked": ["rightisblocked", "rightisnotclear"],
        "ballsPresent": ["beeperspresent", "ballspresent", "ballispresent", "ballpresent"],
        "noBallsPresent": ["nobeeperspresent", "noballspresent", "noballpresent", "noballispresent", "ballsnotpresent", "ballisnotpresent"],
        "facingNorth": ["facingnorth"],
        "facingEast": ["facingeast"],
        "facingSouth": ["facingsouth"],
        "facingWest": ["facingwest"],
        "turnAround": ["turnaround", "turnaruond", "turnaroundd"],

        // Console Typos
        "println": ["printline", "printlne", "printlin", "println"],
        "readBoolean": ["readboolean", "readbool"],
        "readInt": ["readint"],
        "readFloat": ["readfloat"],
        "readLine": ["readline", "readln", "readlin"],
        "Math": ["math"],

        // Graphics Typos
        "getHeight": ["getheight", "getheihgt", "gethieght", "gethight"],
        "getWidth": ["getwidth"],
        "getRadius": ["getradius"],
        "setPosition": ["setlocation", "setposition"],
        "setColor": ["setcolor"],
        "getX": ["getx"],
        "getY": ["gety"],
        "move": ["move"],
        "Color": ["color", "colour"]
    };
    
    var commonMisspelling = function(token) {
        token = token.toLowerCase();
        for (correctSpelling in typos) {
            var misspellings = typos[correctSpelling];
            if (misspellings.indexOf(token) != -1) {
                return correctSpelling;
            }
        }
        return null;
    };

    var libraryError = function(message) {
        CHS.Error.show({
            message: message,
            lineNumber: "",
            trace: printStackTrace(),
            info: CHS.Editor.Information.getInfo(),
        });
    };

    return {
        show:show,
        hide:hide,
        libraryError:libraryError
    };


}());










