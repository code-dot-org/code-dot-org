// Create my sprites, but hide the surprises
var present = createSprite(200, 270, 30, 30);
present.setAnimation("present");

var surprise1 = createSprite(100, 200, 75, 75);
surprise1.setAnimation("bike");

var surprise2 = createSprite(300, 200, 75, 75);
surprise2.setAnimation("puppy");

var clicked_present = false;

function draw() {

  // hide the surprises
  surprise2.visible = false;
  surprise1.visible = false;

  //draw background table and party balloons
  background("lightblue");
  line(100, 100, 100, 400);
  line(300, 125, 300, 400);
  fill("yellow");
  fill("red");
  ellipse(100, 100, 75, 100);
  ellipse(300, 125, 75, 100);
  // Open the present when the mouse is clicked
  if (mouseWentDown()) {
    clicked_present = true;
  }
  if (clicked_present) {
    present.visible = false;
    surprise1.visible = true;
    surprise2.visible = true;

    // Put text on the screen
    fill('black');
    textSize(40);
    text("Happy Birthday!", 50, 40, 400, 100);
  }
  textSize(20);
  text("Click the present to see your surprise!", 30, 380);

  drawSprites();
}
