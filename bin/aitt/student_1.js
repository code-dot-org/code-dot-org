// Create my sprites, but hide the surprises
var present = createSprite(200, 270, 30, 30);
present.setAnimation("present");

var surprise1 = createSprite(100, 200, 75, 75);
surprise1.setAnimation("bike");

surprise1.visible = false;

var surprise2 = createSprite(300, 200, 75, 75);
surprise2.setAnimation("puppy");
surprise2.visible = false;

// keep trac of how often the user shakes the mouse
var shake_count = 0;

function draw() {
  //draw background table and party balloons
  background("lightblue");
  line(100, 100, 100, 400);
  line(300, 125, 300, 400);
  fill("red");
  ellipse(100, 100, 75, 100);
  ellipse(300, 125, 75, 100);
  // Shake the present when the mouse moves
  if (mouseDidMove()) {
    present.rotation = randomNumber(-10, 10);
    shake_count = shake_count + 1;
  }
  // Open the present when there are enough shakes
  if (shake_count > 100){
    present.visible = false;
    surprise1.visible = true;
    surprise2.visible = true;
    playSound("274510__jbeetle__3-men-cheering.mp3");
  }
  // Make the surprises do cool stuff
  surprise1.rotation = surprise1.rotation + 1;
  surprise2.x = 275 + randomNumber(0,50);
  surprise2.y = 175 + randomNumber(0, 50);
  drawSprites();
  // Put text on the screen
  fill('black');
  textSize(40);
  text("Happy Birthday!", 50, 40, 400, 100);
  textSize(20);
  text("Move the mouse to shake your present", 25, 360);
  text("Keep shaking to see your surprise!", 40, 380);
}
