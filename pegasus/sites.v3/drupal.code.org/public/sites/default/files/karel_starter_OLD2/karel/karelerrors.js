KarelRunner.Errors = (function() {
    /* Checks the code to see if any of the karel conditions
     * is missing () after it and raise an error if it's missing.
     */
    var conditionsMissingParens = function(code) {
        var conditions = [
            "frontIsClear", "leftIsClear", "rightIsClear",
            "frontIsBlocked", "leftIsBlocked", "rightIsBlocked",
            "facingNorth", "facingSouth", "facingEast", "facingWest",
            "notFacingNorth", "notFacingSouth", "notFacingEast", "notFacingWest",
            "ballsPresent", "noBallsPresent"
        ];
        var exp = new RegExp("(" + conditions.join("|") + ")(?!\\s*\\(\\))", "");
        var match = code.match(exp);
        if (match != null) {
            var message = "Missing <span class='code'>()</span> after " + 
                        "<span class='code'>" + match[0] + "</span><br/><br/>" + 
                        "You should write <span class='code'>" + match[0] +
                        "()</span>";
            CHS.Error.show({
                message: message,
                lineNumber: "",
                info: CHS.Editor.Information.getInfo()
            });
            return true;
        }
        return false;
    };

    /* Checks the code to see if any of the karel conditions
     * are not defined and gives a list of conditions that are allowed.
     */
    var hasUndefinedCondition = function(code) {
        var conditions = [
            "frontIsClear", "leftIsClear", "rightIsClear",
            "frontIsBlocked", "leftIsBlocked", "rightIsBlocked",
            "facingNorth", "facingSouth", "facingEast", "facingWest",
            "notFacingNorth", "notFacingSouth", "notFacingEast", "notFacingWest",
            "ballsPresent", "noBallsPresent"
        ];

        var showError = false;
        var message;

        var whileLoopRegEx = /while\s*\((.*)\)/gi;
        var whileMatch = whileLoopRegEx.exec(code);
        if (whileMatch != null) {
            var condition = whileMatch[1].replace("()", "").trim();
            if (conditions.indexOf(condition) == -1) {
                message = "You can't write: <span class='code'>" +
                        whileMatch[0] + "</span><br/> " +
                        "You need to choose a valid Karel condition to go inside the while loop. " +
                        "Make sure your spelling and capitalization is correct." +
                        "<br/><br/>These are the choices you have:<pre class='prettyprint'>" +
                        conditions.join("()<br/>") + "()</pre>";
                showError = true;
            }

        }
        var ifRegEx = /if\s*\((.*)\)/gi;
        var ifMatch = ifRegEx.exec(code);
        if (ifMatch != null) {
            var condition = ifMatch[1].replace("()", "").trim();
            if (conditions.indexOf(condition) == -1) {
                message = "You can't write: <span class='code'>" +
                            ifMatch[0] + "</span><br/> " +
                            "You need to choose a valid Karel condition to go inside the if statement. " +
                            "Make sure your spelling and capitalization is correct." +
                            "<br/><br/>These are the choices you have:<pre class='prettyprint'>" +
                            conditions.join("()<br/>") + "()</pre>";
                showError = true;
            }
        }

        if (showError) {
            CHS.Error.show({
                message: message,
                lineNumber: "",
                info: CHS.Editor.Information.getInfo()
            });
        }
        return showError;
    };

    var hasErrors = function(options) {
        if (options.checkMissingParens && conditionsMissingParens(options.code)) {
            // Has errors if missing () on a condition
            return true;
        }
        if (options.checkUndefinedCondition && hasUndefinedCondition(options.code)) {
            // Has errors if there is a condition typo
            return true;
        }
        return false;
    };

    return {
        hasErrors: hasErrors
    }

}());