/**
 * A bunch of JS code we run to check that our SVG paths are what we expect.
 * To generate validator, copy the blockAnalyzer code into your console, put
 * whatever blocks you want in your workspace, and call
 * blockAnalyzer.getValidatorForBlockSpace
 */
var blockAnalyzer = {
  clearAllBlocks: function () {
    Blockly.mainBlockSpace.getTopBlocks().forEach(function (b) { b.dispose(); })
  },
  pathsOfBlocks: function () {
    var allBlocks = Blockly.mainBlockSpace.getAllBlocks();
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
  getValidatorForBlockSpace: function () {
    var paths = blockAnalyzer.pathsOfBlocks();
    var xml = Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));

    var obj = {
      xml: xml,
      paths: paths
    };

    return JSON.stringify(obj, null, "  ");
  },
  validate: function (validator) {
    blockAnalyzer.clearAllBlocks();
    __TestInterface.loadBlocks(validator.xml);
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
          return "Block: " + i + "  Class: " + pathClass +
            " Type: " + Blockly.mainBlockSpace.getAllBlocks()[i].type + "\n" +
            "  Actual: " + actualPath + "\n" +
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
      ".blocklyPathDark": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 87.7816162109375 v 25 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\n",
      ".blocklyPath": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 87.7816162109375 v 25 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\n",
      ".blocklyPathLight": "m 1,7 A 7,7 0 0,1 8,1 H 87.7816162109375 M 86.7816162109375,1 M 1,25 V 8\n"
    },
    "1": {
      ".blocklyPathDark": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 284.9787292480469 v 25 H 50 l -6,4 -3,0 -6,-4 h -7 a 8,8 0 0,0 -8,8 v 469 a 8,8 0 0,0 8,8 H 284.9787292480469 v 10 c 0,5 0,-5 0,0 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPath": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 284.9787292480469 v 25 H 50 l -6,4 -3,0 -6,-4 h -7 a 8,8 0 0,0 -8,8 v 469 a 8,8 0 0,0 8,8 H 284.9787292480469 v 10 c 0,5 0,-5 0,0 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPathLight": "m 1,7 A 7,7 0 0,1 8,1 H 284.9787292480469 M 283.9787292480469,1 M 283.9787292480469,26 M 21.63603896932107,508.3639610306789 a 9,9 0 0,0 6.363961030678928,2.636038969321072 H 284.9787292480469 M 3.050252531694167,516.9497474683059 A 7,7 0 0,1 1,512 V 8\n"
    },
    "2": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 111.31183624267578 v 25 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 111.31183624267578 v 25 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 111.31183624267578 M 110.31183624267578,1 M 110.31183624267578,26 M 107.11183624267578,44.6 l 3.36,-1.8 M 110.31183624267578,51 M 107.11183624267578,69.6 l 3.36,-1.8 M 3.050252531694167,71.94974746830583 A 7,7 0 0,1 1,67 V 1\n"
    },
    "3": {
      ".blocklyPathDark": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 63.23893737792969 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 H 50 l -6,4 -3,0 -6,-4 h -7 a 8,8 0 0,0 -8,8 v 420 a 8,8 0 0,0 8,8 H 63.23893737792969 v 10 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPath": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 63.23893737792969 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 H 50 l -6,4 -3,0 -6,-4 h -7 a 8,8 0 0,0 -8,8 v 420 a 8,8 0 0,0 8,8 H 63.23893737792969 v 10 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPathLight": "m 1,7 A 7,7 0 0,1 8,1 H 15 l 6.5,4 2,0 6.5,-4 H 63.23893737792969 M 62.23893737792969,1 M 59.038937377929685,19.6 l 3.36,-1.8 M 62.23893737792969,36 M 21.63603896932107,469.3639610306789 a 9,9 0 0,0 6.363961030678928,2.636038969321072 H 63.23893737792969 M 3.050252531694167,477.9497474683058 A 7,7 0 0,1 1,473 V 8\n"
    },
    "4": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 29.488250732421875 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 29.488250732421875 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 29.488250732421875 M 28.488250732421875,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "5": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 28.784332275390625 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 28.784332275390625 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 28.784332275390625 M 27.784332275390625,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "6": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 156.6147232055664 H 190.79450225830078 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 97.1292495727539,5 h -79.1292495727539 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 79.1292495727539 z M 180.79450225830078,5 h -31.4854736328125 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 31.4854736328125 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 156.6147232055664 H 190.79450225830078 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 97.1292495727539,5 h -79.1292495727539 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 79.1292495727539 z M 180.79450225830078,5 h -31.4854736328125 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 31.4854736328125 z",
      ".blocklyPathLight": "m 1,1 H 156.6147232055664 M 155.6147232055664,1 H 190.79450225830078 M 1,35 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\nM 98.1292495727539,6 v 25 h -79.1292495727539 M 13.8,24.6 l 3.36,-1.8 M 181.79450225830078,6 v 25 h -31.4854736328125 M 145.1090286254883,24.6 l 3.36,-1.8"
    },
    "7": {
      ".blocklyPathDark": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 147.0941390991211 H 220.5202407836914 v 35 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 210.5202407836914,5 h -119.0941390991211 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 119.0941390991211 z",
      ".blocklyPath": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 147.0941390991211 H 220.5202407836914 v 35 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 210.5202407836914,5 h -119.0941390991211 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 119.0941390991211 z",
      ".blocklyPathLight": "m 1,7 A 7,7 0 0,1 8,1 H 15 l 6.5,4 2,0 6.5,-4 H 147.0941390991211 M 146.0941390991211,1 H 220.5202407836914 M 1,35 V 8\nM 211.5202407836914,6 v 25 h -119.0941390991211 M 87.22610168457031,24.6 l 3.36,-1.8"
    },
    "8": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 78.1292495727539 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 78.1292495727539 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 78.1292495727539 M 77.1292495727539,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "9": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 30.4854736328125 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 30.4854736328125 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 30.4854736328125 M 29.4854736328125,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "10": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 118.0941390991211 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 118.0941390991211 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 118.0941390991211 M 117.0941390991211,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "11": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 129.42586517333984 v 25 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 129.42586517333984 v 25 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\n",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 129.42586517333984 M 128.42586517333984,1 M 1,25 V 1\n"
    },
    "12": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 245.44786071777344 H 430.97593688964844 v 45 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 369.1220474243164,5 h -189.44786071777344 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 h 189.44786071777344 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 245.44786071777344 H 430.97593688964844 v 45 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 369.1220474243164,5 h -189.44786071777344 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 h 189.44786071777344 z",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 245.44786071777344 M 244.44786071777344,1 H 430.97593688964844 M 1,45 V 1\nM 370.1220474243164,6 v 35 h -189.44786071777344 M 175.47418670654298,24.6 l 3.36,-1.8"
    },
    "13": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 154.8695831298828 H 188.44786834716797 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 47.740333557128906,5 h -29.740333557128906 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 29.740333557128906 z M 178.44786834716797,5 h -79.1292495727539 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 79.1292495727539 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 154.8695831298828 H 188.44786834716797 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 47.740333557128906,5 h -29.740333557128906 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 29.740333557128906 z M 178.44786834716797,5 h -79.1292495727539 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 79.1292495727539 z",
      ".blocklyPathLight": "m 1,1 H 154.8695831298828 M 153.8695831298828,1 H 188.44786834716797 M 1,35 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\nM 48.740333557128906,6 v 25 h -29.740333557128906 M 13.8,24.6 l 3.36,-1.8 M 179.44786834716797,6 v 25 h -79.1292495727539 M 95.11861877441406,24.6 l 3.36,-1.8"
    },
    "14": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 101.72518157958984 H 259.6830825805664 v 35 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 180.92044067382812,5 h -45.725181579589844 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 45.725181579589844 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 101.72518157958984 H 259.6830825805664 v 35 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 180.92044067382812,5 h -45.725181579589844 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 45.725181579589844 z",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 101.72518157958984 M 100.72518157958984,1 H 259.6830825805664 M 1,35 V 1\nM 181.92044067382812,6 v 25 h -45.725181579589844 M 130.9952590942383,24.6 l 3.36,-1.8"
    },
    "15": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 28.740333557128906 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 28.740333557128906 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 28.740333557128906 M 27.740333557128906,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "16": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 78.1292495727539 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 78.1292495727539 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 78.1292495727539 M 77.1292495727539,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "17": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 44.725181579589844 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 44.725181579589844 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 44.725181579589844 M 43.725181579589844,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "18": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 158.60790252685547 H 237.73263549804688 v 35 H 69.21114349365234 l -6,4 -3,0 -6,-4 h -7 a 8,8 0 0,0 -8,8 v 119 a 8,8 0 0,0 8,8 H 69.21114349365234 v 10 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 178.06382751464844,5 h -102.60790252685547 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 102.60790252685547 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 158.60790252685547 H 237.73263549804688 v 35 H 69.21114349365234 l -6,4 -3,0 -6,-4 h -7 a 8,8 0 0,0 -8,8 v 119 a 8,8 0 0,0 8,8 H 69.21114349365234 v 10 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 178.06382751464844,5 h -102.60790252685547 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 102.60790252685547 z",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 158.60790252685547 M 157.60790252685547,1 H 237.73263549804688 M 157.60790252685547,36 M 40.847182462973414,168.36396103067892 a 9,9 0 0,0 6.363961030678928,2.636038969321072 H 69.21114349365234 M 1,180 V 1\nM 179.06382751464844,6 v 25 h -102.60790252685547 M 71.25592498779297,24.6 l 3.36,-1.8"
    },
    "19": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 101.60790252685547 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 101.60790252685547 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 101.60790252685547 M 100.60790252685547,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "20": {
      ".blocklyPathDark": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 284.6451110839844 H 453.2498016357422 v 45 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 374.4871597290039,5 h -228.64511108398438 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 h 228.64511108398438 z",
      ".blocklyPath": "m 0,8 A 8,8 0 0,1 8,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 284.6451110839844 H 453.2498016357422 v 45 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 374.4871597290039,5 h -228.64511108398438 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 h 228.64511108398438 z",
      ".blocklyPathLight": "m 1,7 A 7,7 0 0,1 8,1 H 15 l 6.5,4 2,0 6.5,-4 H 284.6451110839844 M 283.6451110839844,1 H 453.2498016357422 M 1,45 V 8\nM 375.4871597290039,6 v 35 h -228.64511108398438 M 141.64204864501954,24.6 l 3.36,-1.8"
    },
    "21": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 96.46044921875 H 254.41835021972656 v 35 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 175.65570831298828,5 h -40.46044921875 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 40.46044921875 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 96.46044921875 H 254.41835021972656 v 35 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\nM 175.65570831298828,5 h -40.46044921875 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 40.46044921875 z",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 96.46044921875 M 95.46044921875,1 H 254.41835021972656 M 1,35 V 1\nM 176.65570831298828,6 v 25 h -40.46044921875 M 130.9952590942383,24.6 l 3.36,-1.8"
    },
    "22": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 194.58238983154297 H 227.64511108398438 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 63.9744873046875,5 h -45.9744873046875 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 45.9744873046875 z M 217.64511108398438,5 h -102.60790252685547 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 102.60790252685547 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 194.58238983154297 H 227.64511108398438 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 63.9744873046875,5 h -45.9744873046875 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 45.9744873046875 z M 217.64511108398438,5 h -102.60790252685547 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 102.60790252685547 z",
      ".blocklyPathLight": "m 1,1 H 194.58238983154297 M 193.58238983154297,1 H 227.64511108398438 M 1,35 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\nM 64.9744873046875,6 v 25 h -45.9744873046875 M 13.8,24.6 l 3.36,-1.8 M 218.64511108398438,6 v 25 h -102.60790252685547 M 110.8372085571289,24.6 l 3.36,-1.8"
    },
    "23": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 111.31183624267578 v 25 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 111.31183624267578 v 25 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\n",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 111.31183624267578 M 110.31183624267578,1 M 110.31183624267578,26 M 107.11183624267578,44.6 l 3.36,-1.8 M 110.31183624267578,61 M 107.11183624267578,79.6 l 3.36,-1.8 M 3.050252531694167,81.94974746830583 A 7,7 0 0,1 1,77 V 1\n"
    },
    "24": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 39.46044921875 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 39.46044921875 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 39.46044921875 M 38.46044921875,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "25": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 107.32571411132812 v 25 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 107.32571411132812 v 25 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 0 z\n",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 107.32571411132812 M 106.32571411132812,1 M 1,25 V 1\n"
    },
    "26": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 44.9744873046875 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 44.9744873046875 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 44.9744873046875 M 43.9744873046875,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "27": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 101.60790252685547 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 101.60790252685547 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 101.60790252685547 M 100.60790252685547,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "28": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 151.3793182373047 H 182.37679290771484 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 97.1292495727539,5 h -79.1292495727539 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 79.1292495727539 z M 172.37679290771484,5 h -26.25006866455078 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 26.25006866455078 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 151.3793182373047 H 182.37679290771484 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 97.1292495727539,5 h -79.1292495727539 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 79.1292495727539 z M 172.37679290771484,5 h -26.25006866455078 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 26.25006866455078 z",
      ".blocklyPathLight": "m 1,1 H 151.3793182373047 M 150.3793182373047,1 H 182.37679290771484 M 1,35 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\nM 98.1292495727539,6 v 25 h -79.1292495727539 M 13.8,24.6 l 3.36,-1.8 M 173.37679290771484,6 v 25 h -26.25006866455078 M 141.92672424316407,24.6 l 3.36,-1.8"
    },
    "29": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 101.60790252685547 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 101.60790252685547 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 101.60790252685547 M 100.60790252685547,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "30": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 245.44786071777344 H 445.1276550292969 v 45 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\nM 383.27376556396484,5 h -189.44786071777344 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 h 189.44786071777344 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 15 l 6,4 3,0 6,-4 H 245.44786071777344 H 445.1276550292969 v 45 c 0,5 0,-5 0,0 H 30 l -6,4 -3,0 -6,-4 H 8 a 8,8 0 0,1 -8,-8 z\nM 383.27376556396484,5 h -189.44786071777344 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 15 h 189.44786071777344 z",
      ".blocklyPathLight": "m 1,1 H 15 l 6.5,4 2,0 6.5,-4 H 245.44786071777344 M 244.44786071777344,1 H 445.1276550292969 M 3.050252531694167,41.94974746830583 A 7,7 0 0,1 1,37 V 1\nM 384.27376556396484,6 v 35 h -189.44786071777344 M 189.62590484619142,24.6 l 3.36,-1.8"
    },
    "31": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 78.1292495727539 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 78.1292495727539 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 78.1292495727539 M 77.1292495727539,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "32": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 25.25006866455078 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 25.25006866455078 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 25.25006866455078 M 24.25006866455078,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "33": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 154.8695831298828 H 188.44786834716797 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 47.740333557128906,5 h -29.740333557128906 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 29.740333557128906 z M 178.44786834716797,5 h -79.1292495727539 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 79.1292495727539 z",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 154.8695831298828 H 188.44786834716797 v 35 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\nM 47.740333557128906,5 h -29.740333557128906 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 29.740333557128906 z M 178.44786834716797,5 h -79.1292495727539 v 5 c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5 v 5 h 79.1292495727539 z",
      ".blocklyPathLight": "m 1,1 H 154.8695831298828 M 153.8695831298828,1 H 188.44786834716797 M 1,35 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\nM 48.740333557128906,6 v 25 h -29.740333557128906 M 13.8,24.6 l 3.36,-1.8 M 179.44786834716797,6 v 25 h -79.1292495727539 M 95.11861877441406,24.6 l 3.36,-1.8"
    },
    "34": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 28.740333557128906 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 28.740333557128906 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 28.740333557128906 M 27.740333557128906,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
    },
    "35": {
      ".blocklyPathDark": "m 0,0 c 0,5 0,-5 0,0 H 78.1292495727539 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPath": "m 0,0 c 0,5 0,-5 0,0 H 78.1292495727539 v 25 c 0,5 0,-5 0,0 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z\n",
      ".blocklyPathLight": "m 1,1 H 78.1292495727539 M 77.1292495727539,1 M 1,25 V 19 m -7.36,-1 q -1.52,-5.5 0,-11 m 7.36,1 V 1 H 2\n"
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
