//This is the unused sprite we attach behaviors to, which is how we get animations to happen over time
//When the animation is over, we remove the behavior from the sprite
createNewSprite({name: 'effectSprite'}, "", ({"x":-200,"y":-200}));

//From https://github.com/code-dot-org/code-dot-org/blob/525025d9870b45a81dcb4c69f7541f4f2b1abeee/apps/src/p5lab/poetry/constants.js
var PALETTES = {
  grayscale: ['#000000','#333333','#666666','#999999','#CCCCCC','#EEEEEE','#FFFFFF'],
  sky: ['#3878A4', '#82A9B1', '#ECCEC4', '#F8B8A8', '#E4929C', '#7D7095'],
  ocean: ['#7FD0F5', '#3FABE3', '#2C7DBB', '#1D57A0', '#144188', '#061F4B'],
  sunrise: ['#F5DC72', '#F4B94F', '#F48363', '#F15C4C', '#372031'],
  sunset: ['#530075', '#921499', '#E559BB', '#F7B9DD', '#307087', '#123F50'],
  spring: ['#303F06', '#385202', '#547607', '#85AF4C', '#C1E876', '#D7FF6B'],
  summer: ['#FAD0AE', '#F69F88', '#EE6E51', '#BC4946', '#425D19', '#202E14'],
  autumn: ['#484F0C', '#AEA82E', '#EEBB10', '#D46324', '#731B31', '#4A173C'],
  winter: ['#EAECE8', '#E3DDDF', '#D3CEDC', '#A2B6BF', '#626C7D', '#A4C0D0'],
  twinkling: ['#FFC702', '#FC9103', '#F17302', '#B83604', '#7E1301'],
  rainbow: ['#A800FF', '#0079FF', '#00F11D', '#FF7F00', '#FF0900'],
  roses: ['#4C0606', '#86003C', '#E41F7B', '#FF8BA0 ', '#FFB6B3']
};

function randomColorFromPalette(palette) {
  return color(PALETTES[palette][randomInt(0, PALETTES[palette].length - 1)]);
}

var drops = [];
var numDrops = 20;

var numBubbles = 25;
var bubbles = [];

var numHearts = 15;
var hearts = [];

var numConfetti = 25;
var confetti = [];

var numStars = 30;
var stars = [];

var numTwinkleStars = 30;
var twinkleStars = [];

function randomInt(min, max) {
 	return Math.floor(Math.random() * (max-min)) + min;
}

function randomColor() {
  return color('hsba(' + randomNumber(0, 359) + ', 100%, 100%, 0.3)').toString();
}

/** Creates a rain effect with 20 drops on the screen
*/
function rainEffect() {
  console.log("inside rain effect");
  push();
  stroke(
  rgb(92, 101, randomInt(140, 220), 0.5));
  strokeWeight(3);
  for (var i = 0; i < drops.length; i++) {
    push();
    translate(drops[i].x - 20, drops[i].y - 20);
    line(0, 0, drops[i].length, drops[i].length * 2);
    drops[i].y = drops[i].y + drops[i].length;
    drops[i].x = drops[i].x + drops[i].length / 2;
    pop();
  }
  drops = drops.filter(function(drop) {
    return (drop.y < 420 && drop.x < 420);
  });
  if (drops.length === 0) {
    removeBehaviorSimple(({name: "effectSprite"}), new Behavior(rainEffect, []));
  }
  pop();
}

//From: https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/p5lab/poetry/commands/foregroundEffects.js
function setForegroundEffect2(option) {
  if(option == "rain") {
      for (var i = 0; i < numDrops; i++) {
      	drops.push({
          x: randomInt(-400, 380),
          y: randomInt(-50, -20),
          length: randomInt(10, 20)
        });
    }
    //addBehaviorSimple(({name: "effectSprite"}), new Behavior(rainEffect, []));
    other.push(rainEffect);
  }
  else if (option == "bubbles") {
    for (var bubble_i = 0; bubble_i < numBubbles; bubble_i++) {
      bubbles.push({
        x: random(-100, 400),
        y: 410,
        velocityX: random(-2, 2),
        size: random(6, 12, 18),
        color: randomColor()
      });
    }
    addBehaviorSimple(({name: "effectSprite"}), new Behavior(bubbleEffect, []));
  }
  else if (option == "hearts") {
    for (var hearts_i = 0; hearts_i < numHearts; hearts_i++) {
      hearts.push({
        x: randomInt(10, 390),
        y: randomInt(10, 390),
        rotation: randomInt(0, 359),
        size: randomInt(10, 120),
        color: randomColor()
      });
    }
    addBehaviorSimple(({name: "effectSprite"}), new Behavior(heartEffect, []));
  }
  else if (option == "confetti") {
	for (var confetti_i = 0; confetti_i < numConfetti; confetti_i++) {
      confetti.push({
        x: randomInt(0, 400),
        y: randomInt(-50, -20),
        velocityX: random(-2, 2),
        size: random(6, 12, 18),
        spin: 1,
        color: randomColor()
      });
    }
    addBehaviorSimple(({name: "effectSprite"}), new Behavior(confettiEffect, []));
  }
  else if (option == "starburst") {
    for (var star_i = 0; star_i < numStars; star_i++) {
      var theta = randomInt(0, 360);
      var velocity = randomInt(4, 12);
      stars.push({
        color: randomColor(),
        x: 200,
        y: 200,
        velocityX: velocity * cos(theta),
        velocityY: velocity * sin(theta)
      });
    }
    addBehaviorSimple(({name: "effectSprite"}), new Behavior(starburstEffect, []));
  }
  else if (option == "twinkling") {
   	for (var twinkle_i = 0; twinkle_i < numTwinkleStars; twinkle_i++) {
      twinkleStars.push({
        color: randomColorFromPalette('twinkling'),
        x: randomInt(0, 400),
        y: randomInt(0, 400),
        alpha: randomInt(1, 100),
        // amount to change the opacity by each frame. p5.random will choose
        // a random value from the array. The reason it's not just random(-6, 6)
        // is that we don't want stars with delta values between 0 and +/-2
        // because they change too slowly to feel noticeable.
        delta: random([-6, -5, -4, -3, 3, 4, 5, 6])
      });
    }
    addBehaviorSimple(({name: "effectSprite"}), new Behavior(twinklingEffect, []));
  }
}



/** Creates a bubble effect that float up from the bottom
*/
function bubbleEffect() {
  push();
  noStroke();
  for(var i = 0; i < bubbles.length; i++) {
    var bubble = bubbles[i];
    fill(bubble.color);
    ellipse(bubble.x, bubble.y, bubble.size, bubble.size);
    var fallSpeed = map(bubble.size, 6, 12, 1, 3);
    bubble.y -= fallSpeed;
    bubble.x += bubble.velocityX;
    if (bubble.x < 0 || bubble.x > 400) {
      bubble.velocityX *= -1;
    }
  }
  pop();
  bubbles = bubbles.filter(function(bubble) {
    return bubble.y > 0;
  });
  if (bubbles.length === 0) {
    removeBehaviorSimple(({name: "effectSprite"}), new Behavior(bubbleEffect, []));
  }
}
/** Creates a heart effect with hearts on the screen that shrink in size
*/
function heartEffect() {
  for(var hearts_j = 0; hearts_j < hearts.length; hearts_j++) {
   	var heart = hearts[hearts_j];
    push();
    translate(heart.x, heart.y);
    rotate(heart.rotation);
    scale(heart.size / 20);
    drawHeart(_renderer.drawingContext, heart.color);
    heart.size--;
    pop();
  }
  hearts = hearts.filter(function(heart) {
    return heart.size > 0;
  });
  if(hearts.length === 0) {
	removeBehaviorSimple(({name: "effectSprite"}), new Behavior(heartEffect, []));
  }
}
/** Creates a confetti effect with confetti that falls from the top of the screen
*/
function confettiEffect() {
	push();
  	noStroke();
  	for(var confetti_j = 0; confetti_j < confetti.length; confetti_j++) {
     	var confetto = confetti[confetti_j];
        push();
        fill(confetto.color);
        translate(confetto.x, confetto.y);
        scale(sin(confetto.spin), 1);
        confetto.spin += 20;
        rect(0, 0, 4, confetto.size);
        var fallSpeed = map(confetto.size, 6, 12, 3, 6);
        confetto.y += fallSpeed;
        confetto.x += confetto.velocityX;
        pop();
    }
  	confetti = confetti.filter(function(confetto) {
      return confetto.y < 420;
    });
  	if(confetti.length === 0) {
		removeBehaviorSimple(({name: "effectSprite"}), new Behavior(confettiEffect, []));
    }
  	pop();
}
/** Creates several starts on the screen that twinkle then fade out
*/
function starburstEffect() {
	push();
    noStroke();
	for(var star_j = 0; star_j < stars.length; star_j++) {
     	var star = stars[star_j];
      	fill(star.color);
      	drawStar(star.x, star.y, 3, 9, 5);
      	star.x += star.velocityX;
      	star.y += star.velocityY;
    }
  	stars = stars.filter(function(star) {
      return star.x > -10 && star.x < 410 && star.y > -10 && star.y < 410;
    });
  	if (stars.length === 0) {
     	removeBehaviorSimple(({name: "effectSprite"}), new Behavior(starburstEffect, []));
    }
  	pop();
}

function twinklingEffect() {
  push();
  noStroke();
  for(var twinkle_j = 0; twinkle_j < twinkleStars.length; twinkle_j++) {
    var star = twinkleStars[twinkle_j];
    console.log(star.color);
   	star.color._array[3] = star.alpha / 255;
    fill(star.color);
    star.alpha += star.delta;
    if (star.alpha > 100) {
      star.delta *= -1;
    }
    drawStar(star.x, star.y, 3, 9, 5);
  }
  twinkleStars = twinkleStars.filter(function(star) {
    return star.alpha > 0;
  });
  if(twinkleStars.length === 0) {
    removeBehaviorSimple(({name: "effectSprite"}), new Behavior(twinklingEffect, []));
  }
  pop();
}

//From: https://github.com/code-dot-org/dance-party/blob/main/src/shapes/heart.js
function drawHeart(ctx, color) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(18,0);
  ctx.lineTo(18,16);
  ctx.lineTo(0,16);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0,5.016);
  ctx.bezierCurveTo(0,6.718,0.84,7.959,2.014,9.128);
  ctx.lineTo(8.85,15.937999999999999);
  ctx.translate(9,15.785369727773288);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.214,2.3475033371885377,0.7940893164012557,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9,-15.785369727773288);
  ctx.lineTo(15.986,9.128);
  ctx.bezierCurveTo(17.16,7.958,18,6.718,18,5.016);
  ctx.bezierCurveTo(18,2.246,15.684,0,12.828,0);
  ctx.translate(12.806054971254465,5.231953976834406);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,5.232,-1.5666019282681247,-2.385404775142245,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-12.806054971254465,-5.231953976834406);
  ctx.translate(5.193945028745534,5.231953976834407);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,5.232,-0.7561878784475481,-1.5749907253216684,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-5.193945028745534,-5.231953976834407);
  ctx.bezierCurveTo(2.316,0,0,2.246,0,5.016);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(9.001,2.673);
  ctx.translate(5.7940041418097,6.064961315456039);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,4.668,-0.8134203244268714,-1.5748674909565874,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-5.7940041418097,-6.064961315456039);
  ctx.bezierCurveTo(3.2379999999999995,1.397,1.1819999999999995,3.38,1.1819999999999995,5.8260000000000005);
  ctx.bezierCurveTo(1.1819999999999995,6.6530000000000005,1.4169999999999994,7.4270000000000005,1.8259999999999996,8.089);
  ctx.translate(4.795990939436072,4.927133807437823);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,4.338,2.324913157276619,3.1395488087915053,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-4.795990939436072,-4.927133807437823);
  ctx.bezierCurveTo(0.458,2.49,2.515,0.508,5.052,0.508);
  ctx.bezierCurveTo(6.73,0.508,8.2,1.376,9,2.673);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

//From https://github.com/code-dot-org/dance-party/blob/main/src/shapes/star.js
function drawStar(x, y, radius1, radius2, numPoints) {
  var angle = 360 / numPoints;
  var halfAngle = angle / 2.0;
  beginShape();
  for (var a = 0; a < 360; a += angle) {
    var sx = x + cos(a) * radius2;
    var sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}