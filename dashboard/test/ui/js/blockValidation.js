/**
 * A bunch of JS code we run to check that our SVG paths are what we expect.
 * To generate validator, copy the blockAnalyzer code into your console, put
 * whatever blocks you want in your workspace, and call
 * blockAnalyzer.getValidatorForWorkspace
 */
var blockAnalyzer = {
  clearAllBlocks: function () {
    Blockly.mainWorkspace.getTopBlocks().forEach(function (b) { b.dispose(); })
  },
  pathsOfBlocks: function () {
    var allBlocks = Blockly.mainWorkspace.getAllBlocks();
    var allPathInfo = {};
    for (var i = 0; i < allBlocks.length; i++) {
      var block = allBlocks[i];
      var blockSvg = document.querySelector("[block-id='" + block.id + "']");

      allPathInfo[i] = blockAnalyzer.getPathInfo(blockSvg);
    }

    return allPathInfo;
  },
  pathClasses: ['.blocklyPathDark', '.blocklyPath', '.blocklyPathLight'],
  getPathInfo: function (blockSvg) {
    var info  = {};
    for (var i = 0; i < blockAnalyzer.pathClasses.length; i++) {
      var pathClass = blockAnalyzer.pathClasses[i];
      var pathElement = blockSvg.querySelector(pathClass);
      info[pathClass] = pathElement.getAttribute('d');
    }
    return info;
  },
  getValidatorForWorkspace: function () {
    var paths = blockAnalyzer.pathsOfBlocks();
    var xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace));

    var obj = {
      xml: xml,
      paths: paths
    };

    return JSON.stringify(obj, null, "  ");
  },
  validate: function (validator) {
    blockAnalyzer.clearAllBlocks();
    BlocklyApps.loadBlocks(validator.xml);
    var info = blockAnalyzer.pathsOfBlocks();
    var failure = blockAnalyzer.compare(info, validator.paths);
    return failure;
  },
  compare: function (actual, expected) {
    var i;
    var numPropsActual = 0, numPropsExpected = 0;
    for (i in actual) {
      numPropsActual++;
    }
    for (i in expected) {
      numPropsExpected++;
    }
    if (numPropsActual !== numPropsExpected) {
      return "Different number of blocks";
    }

    for (i in actual) {
      if (!expected[i]) {
        return "extra block in actual";
      }
      for (var j in blockAnalyzer.pathClasses) {
        var pathClass = blockAnalyzer.pathClasses[j];
        var actualPath = actual[i][pathClass];
        var expectedPath = expected[i][pathClass];
        if (actualPath !== expectedPath) {
          debugger;
          return "Block: " + i + "  Class: " + pathClass + "\n" +
            "  Actual: " + actualPath +
            "Expected: " + expectedPath;
        }
      }
    }
    return "";
  }
};

var validators = {};
validators['turtle_5_6'] = {
  "xml": "<xml><block type=\"when_run\" deletable=\"false\" movable=\"false\"><next><block type=\"procedures_callnoreturn\" inline=\"false\"><mutation name=\"draw a tree\"><arg name=\"depth\"></arg><arg name=\"branches\"></arg></mutation><value name=\"ARG0\"><block type=\"math_number\"><title name=\"NUM\">9</title></block></value><value name=\"ARG1\"><block type=\"math_number\"><title name=\"NUM\">2</title></block></value></block></next></block><block type=\"procedures_defnoreturn\"><mutation><arg name=\"depth\"></arg><arg name=\"branches\"></arg></mutation><title name=\"NAME\">draw a tree</title><statement name=\"STACK\"><block type=\"controls_if\" inline=\"false\"><value name=\"IF0\"><block type=\"logic_compare\" inline=\"true\"><title name=\"OP\">GT</title><value name=\"A\"><block type=\"variables_get\"><title name=\"VAR\">depth</title></block></value><value name=\"B\"><block type=\"math_number\"><title name=\"NUM\">0</title></block></value></block></value><statement name=\"DO0\"><block type=\"draw_colour\" inline=\"true\"><value name=\"COLOUR\"><block type=\"colour_random\"></block></value><next><block type=\"draw_pen\"><title name=\"PEN\">penDown</title><next><block type=\"draw_move\" inline=\"true\"><title name=\"DIR\">moveForward</title><value name=\"VALUE\"><block type=\"math_arithmetic\" inline=\"true\"><title name=\"OP\">MULTIPLY</title><value name=\"A\"><block type=\"math_number\"><title name=\"NUM\">7</title></block></value><value name=\"B\"><block type=\"variables_get\"><title name=\"VAR\">depth</title></block></value></block></value><next><block type=\"draw_turn\" inline=\"true\"><title name=\"DIR\">turnLeft</title><value name=\"VALUE\"><block type=\"math_number\"><title name=\"NUM\">130</title></block></value><next><block type=\"controls_repeat_ext\" inline=\"true\"><value name=\"TIMES\"><block type=\"variables_get\"><title name=\"VAR\">branches</title></block></value><statement name=\"DO\"><block type=\"draw_turn\" inline=\"true\"><title name=\"DIR\">turnRight</title><value name=\"VALUE\"><block type=\"math_arithmetic\" inline=\"true\"><title name=\"OP\">DIVIDE</title><value name=\"A\"><block type=\"math_number\"><title name=\"NUM\">180</title></block></value><value name=\"B\"><block type=\"variables_get\"><title name=\"VAR\">branches</title></block></value></block></value><next><block type=\"procedures_callnoreturn\" inline=\"false\"><mutation name=\"draw a tree\"><arg name=\"depth\"></arg><arg name=\"branches\"></arg></mutation><value name=\"ARG0\"><block type=\"math_arithmetic\" inline=\"true\"><title name=\"OP\">MINUS</title><value name=\"A\"><block type=\"variables_get\"><title name=\"VAR\">depth</title></block></value><value name=\"B\"><block type=\"math_number\"><title name=\"NUM\">1</title></block></value></block></value><value name=\"ARG1\"><block type=\"variables_get\"><title name=\"VAR\">branches</title></block></value></block></next></block></statement><next><block type=\"draw_turn\" inline=\"true\"><title name=\"DIR\">turnLeft</title><value name=\"VALUE\"><block type=\"math_number\"><title name=\"NUM\">50</title></block></value><next><block type=\"draw_pen\"><title name=\"PEN\">penUp</title><next><block type=\"draw_move\" inline=\"true\"><title name=\"DIR\">moveBackward</title><value name=\"VALUE\"><block type=\"math_arithmetic\" inline=\"true\"><title name=\"OP\">MULTIPLY</title><value name=\"A\"><block type=\"math_number\"><title name=\"NUM\">7</title></block></value><value name=\"B\"><block type=\"variables_get\"><title name=\"VAR\">depth</title></block></value></block></value></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block></statement></block></xml>",
  "paths": {
    "0": {
      ".blocklyPathDark": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 87.5 v 25 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\n",
      ".blocklyPath": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 87.5 v 25 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\n",
      ".blocklyPathLight": "m 1,7 A 7,7 0 0,1 8,1 H 87.5 M 86.5,1 M 1,25 V 8\n"
    },
    "1": {
      ".blocklyPathDark": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 284 v 25 H 50 l -6,4 -3,0 -6,-4 h -7 a 8,8 0 0,0 -8,8 v 459 a 8,8 0 0,0 8,8 H 284 v 10 c 0,5 0,-5 0,0 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPath": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 284 v 25 H 50 l -6,4 -3,0 -6,-4 h -7 a 8,8 0 0,0 -8,8 v 459 a 8,8 0 0,0 8,8 H 284 v 10 c 0,5 0,-5 0,0 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPathLight": "m 1,7 A 7,7 0 0,1 8,1 H 284 M 283,1 M 283,26 M 21.63603896932107,498.3639610306789 a 9,9 0 0,0 6.363961030678928,2.636038969321072 H 284 M 3.050252531694167,506.9497474683058 A 7,7 0 0,1 1,502 V 8\n"
    },
    "2": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 111 v 25 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 111 v 25 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 111 M 110,1 M 110,26 M 106.8,44.6 l 3.36,-1.8 M 110,51 M 106.8,69.6 l 3.36,-1.8 M 3.050252531694167,71.94974746830583 A 7,7 0 0,1 1,67 V 1\n"
    },
    "3": {
      ".blocklyPathDark": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 63.5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 H 50 l -6,4 -3,0 -6,-4 h -7 a 8,8 0 0,0 -8,8 v 410 a 8,8 0 0,0 8,8 H 63.5 v 10 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPath": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 63.5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 H 50 l -6,4 -3,0 -6,-4 h -7 a 8,8 0 0,0 -8,8 v 410 a 8,8 0 0,0 8,8 H 63.5 v 10 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPathLight": "m 1,7 A 7,7 0 0,1 8,1 H 15 l 6.5,4 2,0 6.5,-4 H 63.5 M 62.5,1 M 59.3,19.6 l 3.36,-1.8 M 62.5,36 M 21.63603896932107,459.3639610306789 a 9,9 0 0,0 6.363961030678928,2.636038969321072 H 63.5 M 3.050252531694167,467.9497474683058 A 7,7 0 0,1 1,463 V 8\n"
    },
    "4": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 29.5 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 29.5 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 29.5 M 28.5,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "5": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 29 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 29 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 29 M 28,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "6": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 155.99517059326172 H 189.99034118652344 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 96.49517059326172,5 h -78.49517059326172 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 78.49517059326172 z M 179.99034118652344,5 h -31.5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 31.5 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 155.99517059326172 H 189.99034118652344 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 96.49517059326172,5 h -78.49517059326172 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 78.49517059326172 z M 179.99034118652344,5 h -31.5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 31.5 z",
      ".blocklyPathLight": "m 1,1 H 155.99517059326172 M 154.99517059326172,1 H 189.99034118652344 M 1,35 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\nM 97.49517059326172,6 v 25 h -78.49517059326172 M 13.8,24.6 l 3.36,-1.8 M 180.99034118652344,6 v 25 h -31.5 M 144.29034118652345,24.6 l 3.36,-1.8"
    },
    "7": {
      ".blocklyPathDark": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 92 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\n",
      ".blocklyPath": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 92 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\n",
      ".blocklyPathLight": "m 1,7 A 7,7 0 0,1 8,1 H 15 l 6.5,4 2,0 6.5,-4 H 92 M 91,1 M 87.8,19.6 l 3.36,-1.8 M 1,25 V 8\n"
    },
    "8": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 77.49517059326172 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 77.49517059326172 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 77.49517059326172 M 76.49517059326172,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "9": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 30.5 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 30.5 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 30.5 M 29.5,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "10": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 127.5 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 127.5 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 127.5 M 126.5,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "11": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 128.99517059326172 v 25 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 128.99517059326172 v 25 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\n",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 128.99517059326172 M 127.99517059326172,1 M 1,25 V 1\n"
    },
    "12": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 244.55447387695312 H 429.54964447021484 v 45 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 367.54964447021484,5 h -188.55447387695312 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 h 188.55447387695312 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 244.55447387695312 H 429.54964447021484 v 45 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 367.54964447021484,5 h -188.55447387695312 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 h 188.55447387695312 z",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 244.55447387695312 M 243.55447387695312,1 H 429.54964447021484 M 1,45 V 1\nM 368.54964447021484,6 v 35 h -188.55447387695312 M 174.79517059326173,24.6 l 3.36,-1.8"
    },
    "13": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 153.99517059326172 H 187.5544719696045 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 47.5,5 h -29.5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 29.5 z M 177.5544719696045,5 h -78.49517059326172 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 78.49517059326172 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 153.99517059326172 H 187.5544719696045 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 47.5,5 h -29.5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 29.5 z M 177.5544719696045,5 h -78.49517059326172 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 78.49517059326172 z",
      ".blocklyPathLight": "m 1,1 H 153.99517059326172 M 152.99517059326172,1 H 187.5544719696045 M 1,35 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\nM 48.5,6 v 25 h -29.5 M 13.8,24.6 l 3.36,-1.8 M 178.5544719696045,6 v 25 h -78.49517059326172 M 94.85930137634277,24.6 l 3.36,-1.8"
    },
    "14": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 134.99517059326172 H 258.9951705932617 v 35 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 180.99517059326172,5 h -46 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 46 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 134.99517059326172 H 258.9951705932617 v 35 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 180.99517059326172,5 h -46 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 46 z",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 134.99517059326172 M 133.99517059326172,1 H 258.9951705932617 M 1,35 V 1\nM 181.99517059326172,6 v 25 h -46 M 130.79517059326173,24.6 l 3.36,-1.8"
    },
    "15": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 28.5 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 28.5 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 28.5 M 27.5,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "16": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 77.49517059326172 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 77.49517059326172 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 77.49517059326172 M 76.49517059326172,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "17": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 45 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 45 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 45 M 44,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "18": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 158.49517059326172 H 237.49517059326172 v 35 H 69 l -6,4 -3,0 -6,-4 h -7 a 8,8 0 0,0 -8,8 v 119 a 8,8 0 0,0 8,8 H 75 v 10 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 177.49517059326172,5 h -102.49517059326172 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 102.49517059326172 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 158.49517059326172 H 237.49517059326172 v 35 H 69 l -6,4 -3,0 -6,-4 h -7 a 8,8 0 0,0 -8,8 v 119 a 8,8 0 0,0 8,8 H 75 v 10 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 177.49517059326172,5 h -102.49517059326172 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 102.49517059326172 z",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 158.49517059326172 M 157.49517059326172,1 H 237.49517059326172 M 157.49517059326172,36 M 40.63603896932107,168.36396103067892 a 9,9 0 0,0 6.363961030678928,2.636038969321072 H 75 M 1,180 V 1\nM 178.49517059326172,6 v 25 h -102.49517059326172 M 70.8,24.6 l 3.36,-1.8"
    },
    "19": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 101.49517059326172 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 101.49517059326172 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 101.49517059326172 M 100.49517059326172,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "20": {
      ".blocklyPathDark": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 284.5389099121094 H 452.0340805053711 v 45 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 374.0340805053711,5 h -228.53890991210938 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 h 228.53890991210938 z",
      ".blocklyPath": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 284.5389099121094 H 452.0340805053711 v 45 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 374.0340805053711,5 h -228.53890991210938 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 h 228.53890991210938 z",
      ".blocklyPathLight": "m 1,7 A 7,7 0 0,1 8,1 H 15 l 6.5,4 2,0 6.5,-4 H 284.5389099121094 M 283.5389099121094,1 H 452.0340805053711 M 1,45 V 8\nM 375.0340805053711,6 v 35 h -228.53890991210938 M 141.29517059326173,24.6 l 3.36,-1.8"
    },
    "21": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 134.99517059326172 H 253.49517059326172 v 35 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 175.49517059326172,5 h -40.5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 40.5 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 134.99517059326172 H 253.49517059326172 v 35 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 175.49517059326172,5 h -40.5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 40.5 z",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 134.99517059326172 M 133.99517059326172,1 H 253.49517059326172 M 1,35 V 1\nM 176.49517059326172,6 v 25 h -40.5 M 130.79517059326173,24.6 l 3.36,-1.8"
    },
    "22": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 194.49517059326172 H 227.5389060974121 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 64,5 h -46 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 46 z M 217.5389060974121,5 h -102.49517059326172 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 102.49517059326172 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 194.49517059326172 H 227.5389060974121 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 64,5 h -46 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 46 z M 217.5389060974121,5 h -102.49517059326172 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 102.49517059326172 z",
      ".blocklyPathLight": "m 1,1 H 194.49517059326172 M 193.49517059326172,1 H 227.5389060974121 M 1,35 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\nM 65,6 v 25 h -46 M 13.8,24.6 l 3.36,-1.8 M 218.5389060974121,6 v 25 h -102.49517059326172 M 110.84373550415039,24.6 l 3.36,-1.8"
    },
    "23": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 111 v 25 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 111 v 25 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 111 M 110,1 M 110,26 M 106.8,44.6 l 3.36,-1.8 M 110,61 M 106.8,79.6 l 3.36,-1.8 M 3.050252531694167,81.94974746830583 A 7,7 0 0,1 1,77 V 1\n"
    },
    "24": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 39.5 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 39.5 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 39.5 M 38.5,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "25": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 106.99517059326172 v 25 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 106.99517059326172 v 25 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\n",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 106.99517059326172 M 105.99517059326172,1 M 1,25 V 1\n"
    },
    "26": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 45 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 45 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 45 M 44,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "27": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 101.49517059326172 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 101.49517059326172 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 101.49517059326172 M 100.49517059326172,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "28": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 150.99517059326172 H 181.99034118652344 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 96.49517059326172,5 h -78.49517059326172 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 78.49517059326172 z M 171.99034118652344,5 h -26.5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 26.5 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 150.99517059326172 H 181.99034118652344 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 96.49517059326172,5 h -78.49517059326172 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 78.49517059326172 z M 171.99034118652344,5 h -26.5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 26.5 z",
      ".blocklyPathLight": "m 1,1 H 150.99517059326172 M 149.99517059326172,1 H 181.99034118652344 M 1,35 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\nM 97.49517059326172,6 v 25 h -78.49517059326172 M 13.8,24.6 l 3.36,-1.8 M 172.99034118652344,6 v 25 h -26.5 M 141.29034118652345,24.6 l 3.36,-1.8"
    },
    "29": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 101.49517059326172 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 101.49517059326172 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 101.49517059326172 M 100.49517059326172,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "30": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 244.55447387695312 H 443.54964447021484 v 45 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\nM 381.54964447021484,5 h -188.55447387695312 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 h 188.55447387695312 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 244.55447387695312 H 443.54964447021484 v 45 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\nM 381.54964447021484,5 h -188.55447387695312 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 h 188.55447387695312 z",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 244.55447387695312 M 243.55447387695312,1 H 443.54964447021484 M 3.050252531694167,41.94974746830583 A 7,7 0 0,1 1,37 V 1\nM 382.54964447021484,6 v 35 h -188.55447387695312 M 188.79517059326173,24.6 l 3.36,-1.8"
    },
    "31": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 77.49517059326172 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 77.49517059326172 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 77.49517059326172 M 76.49517059326172,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "32": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 25.5 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 25.5 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 25.5 M 24.5,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "33": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 153.99517059326172 H 187.5544719696045 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 47.5,5 h -29.5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 29.5 z M 177.5544719696045,5 h -78.49517059326172 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 78.49517059326172 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 153.99517059326172 H 187.5544719696045 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 47.5,5 h -29.5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 29.5 z M 177.5544719696045,5 h -78.49517059326172 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 78.49517059326172 z",
      ".blocklyPathLight": "m 1,1 H 153.99517059326172 M 152.99517059326172,1 H 187.5544719696045 M 1,35 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\nM 48.5,6 v 25 h -29.5 M 13.8,24.6 l 3.36,-1.8 M 178.5544719696045,6 v 25 h -78.49517059326172 M 94.85930137634277,24.6 l 3.36,-1.8"
    },
    "34": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 28.5 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 28.5 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 28.5 M 27.5,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "35": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 77.49517059326172 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 77.49517059326172 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 77.49517059326172 M 76.49517059326172,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    }
  }
};

function validateWithKey(key) {
  var validator = validators[key];
  if (!validator) {
    return "No validator exists for " + key;
  }
  return blockAnalyzer.validate(validator);
};
