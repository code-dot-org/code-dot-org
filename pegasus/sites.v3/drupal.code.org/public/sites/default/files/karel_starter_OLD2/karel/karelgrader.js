KarelGrader = (function() {
    var worlds = [];
    var solutions = [];

    var nextWorldIndex = 0;

    var statuses = [];

    var isTutor = false;

    var setWorlds = function(options) {
        for (var i=0; i < options.worlds.length; i++) {
            var w = options.worlds[i];
            //loadWorld(w);
        }
    };


    // Returns the numeric value of the world from the text
    var karelDir = function(dir){
        var val;
        if(dir == "EAST"){
            val = Karel.EAST;
        }
        if(dir == "WEST"){
            val = Karel.WEST;
        }
        if(dir == "SOUTH"){
            val = Karel.SOUTH;
        }
        if(dir == "NORTH"){
            val = Karel.NORTH;
        }
        return val;
    }

    /* loads the world from the given filename
     * and creates two KarelWorld objects.
     * start and solution
     */
    var loadWorld = function(world){
        var prefix = '/editor/karel/worlds/';
        var suffix = ".json";
        var url = prefix + world + suffix;

        var start;
        var solution;
        
        $.ajax({
          url: url,
          dataType: 'json',
          success: function(data){
                start = new KarelWorld(data.rows, data.cols);
                start.setKarelLocation(data.start.row, data.start.col);
                start.setKarelDir(karelDir(data.dir));
                start.setupBeepers(data.beepers);
                start.setFilename(world);
                worlds.push(start);
          }
        });

        var solutionURL = prefix + world + "SOLUTION" + suffix;

        $.ajax({
            url:solutionURL,
            dataType: 'json',
            success: function(data) {
                solution = new KarelWorld(data.rows, data.cols);
                solution.setKarelLocation(data.start.row, data.start.col);
                solution.setKarelDir(karelDir(data.dir));
                solution.setupBeepers(data.beepers);
                solution.setFilename(world + "SOLUTION");
                solutions.push(solution);
            },
            error: function(data) {
                solution = null;
            }
        });

    };

    var getSolutionWorld = function(world) {
        for (var i=0; i < solutions.length; i++) {
            var sol = solutions[i];
            var solName = sol.getFilename();
            var worldName = world.getFilename();
            if (worldName + "SOLUTION" == solName) {
                return sol;
            }
        }
    };

    var testWorld = function(w) {
        if (w >= worlds.length) {
            nextWorldIndex = 0;
            var sel = $("#karelworld").find(":selected");
            var world = sel.attr('data-world');
            
            CHS.Editor.KAREL_WORLD = world;
            KarelRunner.loadWorld(CHS.Editor.KAREL_WORLD);
            displayModal();
            return;
        }

        KarelRunner.world = worlds[w];
        KarelRunner.solutionWorld = getSolutionWorld(worlds[w]);
        KarelRunner.delayTime = 0;
        nextWorldIndex = w+1;
        KarelRunner.run(CHS.Editor.getCode(), true);
    };

    var testWorlds = function() {
        statuses = [];
        testWorld(0);
    };

    var setWorldStatus = function(world, status) {
        statuses.push({
            world: world.getFilename(),
            success: status
        });
        testWorld(nextWorldIndex);
    };

    var displayModal = function() {
        var num_successes = 0;
        var worlds = "";
        for (var i=0; i < statuses.length; i++) {
            var s = statuses[i];
            if (s.success) {
                num_successes++;
            }
            var status_class = s.success ? "pass" : "fail";
            worlds += '<div class="world-status">' +
                        '<div class="status left ' + status_class + '">' +
                        '</div><h4 class="left name">' + s.world + '</h4></div><div class="clear"></div>';
        }

        var all_right = num_successes == statuses.length;
        var all_wrong = num_successes == 0;

        var message;
        var next_button = "";
        if (all_right) {
            message = "Great job! Your program works.<br/>Make sure your style is good.";
            next_button = '<a id="submit-correct" href="#" class="btn btn-primary alert-close"><h3>Submit</h3></a>';
        } else if (all_wrong) {
            message = "Oops. It looks like your program isn't quite working.<br/>You should keep working or ask a question.";
        } else {
            message = "Not quite. Your program doesn't work on all of the worlds.<br/>Make sure to test on all of them."
        }

        var close_button = '<a href="#" class="btn btn-primary alert-close"><h3>Keep Working</h3></a>';

        if (isTutor) {
            next_button = "";
            close_button = '<a href="#" class="btn btn-primary alert-close"><h3>Close</h3></a>';
        }

        var alert = '<div class="modal" id="autograder-modal">' +
                        '<div class="modal-header">' +
                            '<button type="button" class="alert-close close" data-dismiss="modal">&times;</button>' +
                            '<h3>CodeHS</h3>' +
                        '</div>' +
                        '<div class="modal-body">' +
                            '<h4>' +
                            message +
                            '</h4>' +
                            '<p>' +
                            worlds +
                            '</p>' +
                        '</div>' +
                        '<div class="modal-footer">' +
                            close_button + next_button +
                        '</div>' +
                    '</div>';

        $("body").append(alert);
        $("#autograder-modal").modal({
            "backdrop":"static"
        });
        CHS.Editor.Approval.setup();

        if (all_right && !isTutor) {
            var info = CHS.Editor.Information.getInfo();
            $("#submit-correct").click(function() {
                CHS.ConceptMap.complete({
                    type: info.type,
                    id: info.id,
                    correct: true
                }, function() {
                    window.location.href = $(CHS.Editor.NEXT_BUTTON).attr("data-next");
                });
            });
        }

        function close() {
            $("#autograder-modal").modal('hide');
            $("#autograder-modal").remove();
        }

        $(".alert-close").on("click", close);
        
    };

    var tutor = function() {
        isTutor = true;
        $("#check-program").click(testWorlds);
    };

    return {
        setWorlds:setWorlds,
        testWorlds: testWorlds,
        setWorldStatus: setWorldStatus,
        tutor: tutor
    };


}());

KarelRunner.Tester = (function() {
    var TESTER_MESSAGE = "#tester-message";

    function worldsAreEquivalent(a, b) {

        var graded = {
            success: true,
            message: "<strong>Nice job!</strong> You got it!"
        };
        
        if (a.rows != b.rows || a.cols != b.cols) {
            CHS.log("Dimensions don't match up");
            graded.success = false;
            graded.message = "<strong>Oops!</strong> Something's wrong here.";
        }

        /* Check if all the corners have the
         * same number of balls 
         */
        for (var i = 0; i < a.rows; i++) {
            for (var j = 0; j < a.cols; j++) {
                var aBalls = a.grid.get(i,j);
                var bBalls = b.grid.get(i,j);
                if (aBalls != bBalls) {
                    // CHS.log("not the correct number of balls at (" + i + ", " + j + ")");
                    graded.success = false;
                    var isare = aBalls == 1 ? "is" : "are";
                    var plural = bBalls == 1 ? "" : "s";
                    var row = i+1;
                    var col = j+1;
                    graded.message = "<strong>Oops!</strong> There should be " 
                                    + bBalls + " ball" + plural 
                                    + " at (" + row + ", " + col + ")"
                                    + " but there " + isare + " " + aBalls;
                }
            }
        }

        if (a.karelRow != b.karelRow && b.karelRow != null) {
            // CHS.log("Karel's on the wrong street");
            graded.success = false;
            var aRow = parseInt(a.karelRow) + 1;
            var bRow = parseInt(b.karelRow) + 1;
            graded.message = "<strong>Oops!</strong> Karel should be on street " + 
                            bRow + " but is on street " + aRow;
        }

        if (a.karelCol != b.karelCol && b.karelCol != null) {
            // CHS.log("Karel's on the wrong avenue");
            graded.success = false;
            var aCol = parseInt(a.karelCol) + 1;
            var bCol = parseInt(b.karelCol) + 1;
            graded.message = "<strong>Oops!</strong> Karel should be on avenue " + bCol 
                            + " but is on avenue " + aCol;
        }

        if (a.karelDir != b.karelDir && b.karelDir != null) {
            // CHS.log("Karel's facing the wrong direction");
            graded.success = false;
            graded.message = "<strong>Oops!</strong> Karel should be facing " + 
                            KarelRunner.dirName(b.karelDir) + " but is facing " + 
                            KarelRunner.dirName(a.karelDir);
        }

        return graded;
    }


    var hasError = function() {
        for (var i=0; i < KarelRunner.commands.length; i++) {
            if (KarelRunner.commands[i] <= Karel.ERROR) {
                /* Commands with values less than or equal to ERROR
                 * are all errors */
                return true;
            }
        }
        return false;
    };

    /* @param autograding specifies if it's testing
     * for the mulitiworld autograder or not 
     * true - multiworld autograder -- don't show messages above canvas
     */
    var testSolution = function(autograding) {
        if (KarelRunner.solutionWorld == null) {
            CHS.log("no solution world");
            return;
        }

        var graded = worldsAreEquivalent(KarelRunner.world, KarelRunner.solutionWorld);
        if (!autograding) {
            $(TESTER_MESSAGE).html(graded.message);
            if (graded.success) {
                $(TESTER_MESSAGE).removeClass("gone").removeClass("alert-error").addClass("alert-info");
            } else {
                $(TESTER_MESSAGE).removeClass("gone").removeClass("alert-info").addClass("alert-error");
            }
        }

        graded.success = hasError() ? false : graded.success;
        return graded;

    };

    var hideMessage = function() {
        $(TESTER_MESSAGE).addClass("gone");
    };

    return {
        testSolution: testSolution,
        hideMessage: hideMessage
    }

}());