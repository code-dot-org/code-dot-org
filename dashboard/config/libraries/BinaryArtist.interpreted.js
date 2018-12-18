var SIZE,pxW,pxH;
var inputEvents = [];
var queue = [];
var grid = [];
var pos = 0;

gridSize(8);

function gridSize(n) {
  SIZE = n;
  pxW = World.width / SIZE;
  pxH = World.height / SIZE;
}

function pad (str, size) {
  var s = String(str);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

function append(str) {
  queue = queue.concat(str.split(""));
  //binary = binary.substring(binary.length - ((SIZE * SIZE) * 2), binary.length);
}

function drawBin(bin) {
  append(bin);
}

function drawBinScreen() {
  for(var i=0; i<arguments.length; i++) {
    drawBin(arguments[i]);
  }
}

function drawDec(dec) {
  var decString = (+dec).toString(2);
  decString = pad(decString, 8);
  append(decString);
}

function drawString(str) {
  var charString;
  for (var i = 0; i < str.length; i++) {
    charString = str[i].charCodeAt(0).toString(2);
    append(pad(charString, 8));
  }
}

function drawGrid() {
  background(64);
  stroke(192);
  strokeWeight(1);
  for (var i=0; i<SIZE; i++) {
    line(i * pxW, 0, i * pxW, World.height);
    line(0, i * pxH, World.width, i * pxH);
  }
}

function drawPixels(src) {
  drawGrid();
  for (i=0; i<src.length; i++) {
    drawPixel(i, src[i]);
  }
}

function preview() {
  drawPixels(queue);
  background("rgba(255, 255, 255, 0.5)");
}

function drawPixel(loc, val) {
  if (val == 1) {
    fill(255);
  } else if (val == 0) {
    fill(0);
  } else {
    noFill();
  }
  rect((loc % SIZE) * pxW, (Math.floor(loc / SIZE) % SIZE) * pxH, pxW, pxH);
}

function goTo(loc) {
  queue.push({'command': 'abs', 'arg': loc});
}

function move(dir) {
  queue.push({'command': 'shift', 'arg': dir});
}

function drawPixelHere(val) {
  queue.push({'command': 'draw', 'arg': val});
}

function whenKey(key, event) {
  inputEvents.push({type: keyWentDown, event: event, param: key});
}

function draw() {

  // Run key events
  for (i = 0; i < inputEvents.length; i++) {
    eventType = inputEvents[i].type;
    event = inputEvents[i].event;
    param = inputEvents[i].param;
    if (eventType(param)) {
      event();
    }
  }
  
  // Process queue
  if (queue.length > 0) {
    var temp = queue.shift();

    // if object, process as command
    if (typeof(temp) == "object") {
      if (temp.command == "abs") {
        pos = temp.arg % (SIZE * SIZE);
      } else if (temp.command == "shift") {
        if (temp.arg == 'up') {
          pos = (pos - SIZE) % (SIZE * SIZE);
        } else if (temp.arg == 'down') {
          pos = (pos + SIZE) % (SIZE * SIZE);
        } else if (temp.arg == 'left') {
          pos = (pos - 1) % (SIZE * SIZE);
        } else if (temp.arg == 'right') {
          pos = (pos + 1) % (SIZE * SIZE);
        }
      } else if (temp.command == "draw") {
        var val = temp.arg;
        if (val == "toggle") {
          val = (grid[pos] == 0 ? 1 : 0);
        }
        grid[pos] = val;
      }
    } else {
      grid[pos] = temp;
      pos = (pos + 1) % (SIZE * SIZE);
    }
  }
  
  // Draw binary
  drawPixels(grid);
  
  // Track current location
  stroke("red");
  noFill();
  strokeWeight(2);
  drawPixel(pos);

}