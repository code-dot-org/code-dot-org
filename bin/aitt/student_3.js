function draw() {
  // Create my sprites
  var present = createSprite();
  present.setAnimation("present");

  var surprise1 = createSprite();
  surprise1.setAnimation("bike");

  var surprise2 = createSprite();
  surprise2.setAnimation("puppy");

  var happy = createSprite();
  happy.setAnimation("happy");

  //draw background table and party balloons
  background("lightblue");

    // Put text on the screen
    fill('black');
    textSize(40);
    text("Happy Birthday!");

  drawSprites();
}
