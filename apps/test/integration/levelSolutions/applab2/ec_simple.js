import {testApplabConsoleOutput} from '../../util/levelTestTypes';
import {TestResults} from '@cdo/apps/constants';

module.exports = {
  app: 'applab',
  skinId: 'applab',
  levelFile: 'levels',
  levelId: 'ec_simple',
  tests: [
    {
      description: 'Expected solution.',
      editCode: true,
      xml: '',
      runBeforeClick: function(assert) {
        // room to add tests here

        // add a completion on timeout since this is a freeplay level
        setTimeout(function() {
          Applab.onPuzzleComplete();
        }, 1);
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    // Missing coverage of the data category here.
    // Most data blocks make network calls and modify data records. To get
    // test coverage of these here, we would probably need to mock portions of that.
    // We do have UI test coverage of data apis in dataBlocks.feature

    // These exercise all of the blocks in Control category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    testApplabConsoleOutput({
      testName: 'Control',
      source: `
        var count = 0;
        for (var i = 0; i < 4; i++) {
          count++;
        }
        i = 5;
        while(i > 0) {
          count++;
          i--;
        }
        if (count > 0) {
          count++;
        }
        if (count < 0) {
          count++;
        } else {
          count--;
        }
        getTime();
        var interval = setInterval(function() {
          count++;
        }, 100);
        clearInterval(interval);
        var timeout = setTimeout(function() {
          console.log(count);
          clearTimeout(timeout);
        }, 200);
      `,
      ticks: 200,
      expect: '9'
    }),

    // These exercise all of the blocks in Control category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    testApplabConsoleOutput({
      testName: 'Variables',
      source: `
        // prompt and promptNum are covered in dropletUtilsTest
        var x = 1;
        var y;
        y = 2;
        console.log("message");
        var str = "Hello World";
        var a = str.substring(6, 11);
        var b = str.indexOf("World");
        var c = str.includes("World");
        var d = str.length;
        var e = str.toUpperCase();
        var f = str.toLowerCase();
        var list = ["a", "b", "d"];
        var g = list.length;
        insertItem(list, 2, "c");
        appendItem(list, "f");
        removeItem(list, 0);
      `,
      expect: '"message"'
    }),

    // These exercise some simple use cases for the list blocks:
    // insertItem, appendItem, and removeItem
    testApplabConsoleOutput({
      testName: 'List blocks',
      source: `
        var list = ["a", "b", "d"];
        var g = list.length;
        insertItem(list, 2, "c");
        appendItem(list, "f");
        removeItem(list, 0);
        console.log(g + ' ' + list.length + ' ' + list.join(','));
      `,
      expect: '"3 4 b,c,d,f"'
    }),

    // These exercise all of the blocks in canvas category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    testApplabConsoleOutput({
      testName: 'Canvas',
      source: `
        createCanvas("id", 320, 480);
        setActiveCanvas("id");
        line(0, 0, 160, 240);
        circle(160, 240, 100);
        rect(80, 120, 160, 240);
        setStrokeWidth(3);
        setStrokeColor("red");
        setFillColor(rgb(255,0,0));
        drawImage("id", 0, 0);
        var imgData = getImageData(0, 0, 320, 480);
        putImageData(imgData, 0, 0);
        clearCanvas();
        getRed(imgData, 0, 0);
        getGreen(imgData, 0, 0);
        getBlue(imgData, 0, 0);
        getAlpha(imgData, 0, 0);
        setRed(imgData, 0, 0, 255);
        setGreen(imgData, 0, 0, 255);
        setBlue(imgData, 0, 0, 255);
        setAlpha(imgData, 0, 0, 255);
        setRGB(imgData, 0, 0, 255, 255, 255);
      `,
      expect: ''
    }),

    // These exercise all of the blocks in Turtle category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    testApplabConsoleOutput({
      testName: 'Turtle',
      source: `
        moveForward(25);
        moveBackward(25);
        move(25, 25);
        moveTo(0, 0);
        dot(5);
        turnRight(90);
        turnLeft(90);
        turnTo(0);
        arcRight(90, 25);
        arcLeft(90, 25);
        getX();
        getY();
        getDirection();
        penUp();
        penDown();
        penWidth(3);
        penColor("red");
        penRGB(120, 180, 200);
        show();
        hide();
        speed(50);
      `,
      expect: ''
    }),

    // These exercise all of the blocks in Turtle category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    testApplabConsoleOutput({
      testName: 'Functions',
      source: `
        function myFunction() {
        }
        function myFunction2(n) {
          return n;
        }
        myFunction();
        myFunction2(1);
      `,
      expect: ''
    }),

    {
      description: 'Block palette categories',
      editCode: true,
      xml: '',
      runBeforeClick: function(assert) {
        const expectedCategories = [
          'UI controls',
          'Canvas',
          'Data',
          'Turtle',
          'Control',
          'Math',
          'Variables',
          'Functions'
        ];
        const actualCategories = $('.droplet-palette-group-header')
          .map((i, el) => $(el).text())
          .toArray();
        assert.deepEqual(expectedCategories, actualCategories);

        // add a completion on timeout since this is a freeplay level
        setTimeout(function() {
          Applab.onPuzzleComplete();
        }, 1);
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
