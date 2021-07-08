// DATA STRUCTURES:
// Text: An object that has a value field and a type field. The value is the
// string value of the text. The type should be one of: 'blank', 'literal', 'random'
// Line: An array of Text objects
// Poem: An object that has field for title, author, and lines. The title and author
// fields should both have type Text. The lines field should be an array of Line values.

/* BEGIN CONSTANTS */
var outerMargin = 50;
var defaultLineHeight = 50;
var defaultFontSize = 25;
var blankText = {value: '', type: 'blank'};
var playspaceSize = 400;
/* END CONSTANTS */

/* BEGIN STATE */
var poem = {
  title: blankText,
  author: blankText,
  lines: []
};
var isVisible = false;
var backgroundEffect = function() {};
var foregroundEffect = function() {};
/* END STATE */

// This function runs as part of the draw loop
function poemBotDraw() {
  backgroundEffect();
  foregroundEffect();
  if (isVisible) {
    drawPoem();
  }
}
// Push our PoemBot draw function into the NativeSpriteLab.interpreted.js
// draw loop. See NativeSpriteLab.interpreted.js for usage.
other.push(poemBotDraw);

function drawPoem() {
  var yCursor = outerMargin;
  fill('black');
  noStroke();
  textSize(defaultFontSize);
  textAlign(CENTER);
  if (poem.title) {
    textSize(defaultFontSize * 2);
    text(poem.title, playspaceSize / 2, yCursor);
    textSize(defaultFontSize);
    yCursor += defaultLineHeight;
  }
  if (poem.author) {
    yCursor -= defaultLineHeight / 2;
    textSize(16);
    text(poem.author, playspaceSize / 2, yCursor);
    textSize(defaultFontSize);
    yCursor += defaultLineHeight;
  }

  var lineHeight = (playspaceSize - yCursor) / poem.lines.length;
  for (var i = 0; i < poem.lines.length; i++) {
    drawPoemLine(poem.lines[i], yCursor);
    textSize(defaultFontSize);
    yCursor += lineHeight;
  }
}

function drawPoemLine(line, yPos) {
  // Concatenate all the text values together so we can compute the length
  // of the printed text
  var words = [];
  var i = 0;
  for (i = 0; i < line.length; i++) {
    words.push(line[i].value);
  }
  var fullLine = words.join(' ');
  var fullWidth = textWidth(fullLine);
  textSize(Math.min(defaultFontSize, defaultFontSize * (playspaceSize - outerMargin) / fullWidth));

  // recompute with scaled textSize
  fullWidth = textWidth(fullLine);

  var start = playspaceSize / 2 - fullWidth/2;
  textAlign(LEFT);
  var xCursor = start;
  for (i = 0; i < line.length; i++) {
    // TODO: Make font colors configurable by students
    if (line[i].type == "random") {
      fill("blue");
    } else {
      fill("black");
    }
    text(line[i].value, xCursor, yPos);
    xCursor += textWidth(line[i].value + ' ');
  }
}

// polyfill for Array.prototype.flat
function flatten(list1, list2) {
  var result = [];
  var i;
  for (i = 0; i < list1.length; i++) {
    result.push(list1[i]);
  }
  for (i = 0; i < list2.length; i++) {
    result.push(list2[i]);
  }
  return result;
}

/* BEGIN BLOCK DEFINITIONS */
function textConcat(text1, text2) {
  if (!text1) {
    return text2;
  }
  if (!text2) {
    return text1;
  }
  return flatten(text1, text2);
}

function randomWord() {
  // TODO: get curated random word list from Curriculum
  var words = ['cat', 'dog', 'fish'];
  var index = randomNumber(0, words.length - 1);
  return words[index];
}

function addLine(line) {
  poem.lines.push(line || [blankText]);
}

function setTitle(line) {
  if (line) {
    poem.title = line[0].value;
  }
}

function setAuthor(line) {
  if (line) {
  	poem.author = line[0].value;
  }
}

function showPoem() {
  isVisible = true;
}

// TODO: would it be possible to re-use the background/foreground effect code from dance party?
function setBackgroundEffect(effectName) {
  if (effectName === 'solid') {
    backgroundEffect = function() {
      background('pink');
    };
  } else if (effectName === 'rainbow') {
    var hue = 0;
    colorMode(HSL, 360);
    backgroundEffect = function() {
      background(hue, 200, 200);
      hue = (hue + 1) % 360;
    };
  }
}

function setForegroundEffect(effectName) {
  var i;
  if (effectName === 'rain') {
    drops = [];
    for (i = 0; i < 20; i++) {
      drops.push({x: randomNumber(0, 380), y: randomNumber(0, 380), length: randomNumber(10, 20)});
    }
    foregroundEffect = function() {
      push();
      stroke(rgb(92, 101, randomNumber(140, 220), 0.5));
      strokeWeight(3);
      for (var i = 0; i < drops.length; i++) {
        push();
        translate(drops[i].x - 20, drops[i].y - 20);
        line(0, 0, drops[i].length, drops[i].length * 2);
        drops[i].y = (drops[i].y + drops[i].length) % 420;
        drops[i].x = (drops[i].x + (drops[i].length / 2)) % 420;
        pop();
      }
      pop();
    };
  } else if (effectName === 'bubbles') {
    bubbles = [];
    for (i = 0; i < 25; i++) {
      bubbles.push({
        x: random(-100, playspaceSize),
        y: 410,
        velocityX: random(-2, 2),
        size: random(6, 12, 18),
        color: randomColor(100, 50, 0.25),
      });
    }
    foregroundEffect = function() {
      push();
      noStroke();
      for (var i = 0; i < bubbles.length; i++) {
        bubble = bubbles[i];
        push();
        fill(bubble.color);
        translate(bubble.x, bubble.y);
        ellipse(0, 0, bubble.size, bubble.size);
        var fallSpeed = map(bubble.size, 6, 12, 1, 3);
        bubble.y -= fallSpeed;
        if (bubble.y < 0) {
          bubble.y = 420;
        }
        bubble.x += bubble.velocityX;
        if (bubble.x < 0 || bubble.x > playspaceSize) {
          bubble.velocityX *= -1;
        }
        pop();
      }
      pop();
    };
  }
}
/* END BLOCK DEFINITIONS */

//Mike's setPoem prototype

function setPoem(key){
  if(key=="wordsworth"){
    poem = {
      title: "I Wandered Lonely as a Cloud",
      author: "William Wordsworth",
      lines: []
    };
    poem.lines.push([{value: "I wandered lonely as a cloud", type: 'literal'}]);
    poem.lines.push([{value: "That floats on high o'er vales and hills,", type: 'literal'}]);
    poem.lines.push([{value: "When all at once I saw a crowd,", type: 'literal'}]);
    poem.lines.push([{value: "A host, of golden daffodils;", type: 'literal'}]);
    poem.lines.push([{value: "Beside the lake, beneath the trees,", type: 'literal'}]);
    poem.lines.push([{value: "Fluttering and dancing in the breeze.", type: 'literal'}]);
    poem.lines.push([{value: "", type: 'literal'}]);
    poem.lines.push([{value: "Continuous as the stars that shine", type: 'literal'}]);
    poem.lines.push([{value: "And twinkle on the milky way,", type: 'literal'}]);
    poem.lines.push([{value: "They stretched in never-ending line", type: 'literal'}]);
    poem.lines.push([{value: "Along the margin of a bay:", type: 'literal'}]);
    poem.lines.push([{value: "Ten thousand saw I at a glance,", type: 'literal'}]);
    poem.lines.push([{value: "Tossing their heads in sprightly dance.", type: 'literal'}]);
  }

}