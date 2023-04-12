/* Student answers may vary. This solution fulfills all of the requirements
 * in the rubric. The text has been moved after drawSprites() to ensure
 * it appears over everything else.
 */

//Sprites
var moving_crutch = createSprite(100, 300);
moving_crutch.setAnimation("crutch_1");
var bunny = createSprite(330, 200);
bunny.setAnimation("bunny1_hurt_1");
bunny.height = 100;
bunny.width = 100;
bunny.scale = 0.7;
var stable_crutch = createSprite(330, 300);
stable_crutch.setAnimation("crutch_1");

//x position for bunny, moving crutch, and stable crutch
var x_position = 200;

//Code to draw background
function draw() {
  /*Background with Multiple Shapes (Score: 1/1)

    A bed composed of multiple shapes is placed in
    the background as a part of the scene.
  */
  //Draws a bed and text to describe the card
  background(color(255, 135, 0));

  //bed
  strokeWeight(15);
  fill(color(255, 0, 0));
  regularPolygon(420, 350, 4, 200);

  //pillows
  fill(255, 255, 255);
  rect(278, 160, 150, 100, 25);

  //Update Values
  //random number for rotation
  var randomDegrees = randomNumber(-10, 10);

  /*
  At Least One Sprite Responds to User Input (Score: 1/1)

  moving_crutch.x moves left or right when the user taps
  the corresponding arrow key
  */
  //move the crutch left or right based on user input and rotate randomly
  //since keyWentDown is used, the user must repeatedly press the keys
  if (keyWentDown("right")) {
    /*
     Increments and/or Decrements a
     Variable or Sprite Property (Score: 1/1)

     the moving_crutch.x property is incremented and
     decremented within this if/else statement.
    */
    moving_crutch.x += 10;
    moving_crutch.rotation = randomDegrees;
  }
  if (keyWentDown("left")){
    moving_crutch.x -=10;
    moving_crutch.rotation = randomDegrees;
  }

  /*
   At Least One Conditional Triggered
   by Variable or Sprite Property (Score: 1/1)

   The conditional below is triggered
   by the moving_crutch.x property when its value
   is greater than or equal to the value of
   stable_crutch.x - 30
  */
  //If the moving crutch is within 30 of the other crutch, the user
  //has helped the bunny
  if (moving_crutch.x >= stable_crutch.x - 30){
    fill(255,255,255);
    bunny.setAnimation("bunny1_ready_1");
    bunny.scale = 1;
    bunny.x = x_position;
    moving_crutch.x = x_position - 30;
    stable_crutch.x = x_position;
    textSize(15);
    text("Nice! You helped Bunny!", 123, 120);

  }

  /*Updated Three Sprite Properties (Score: 1/1)

  3 sprite properties were updated in the code from
  above:
  moving_crutch.x and moving_crutch.roation were
  both updated and change when the user presses
  the left or right arrow keys

  bunny.scale is updated and shows a bigger bunny
  when the moving_crutch.x conditional is triggered.
  */

  //Draw Sprites and text
  drawSprites();
  //text and instructions
  textFont("Arial");
  textSize(50);
  fill(255,255,255);
  text("Get well soon!", 40, 60);
  textSize(15);
  text("Get the other crutch to Bunny with the arrow keys", 35, 80);
  text("to help her get out of bed!", 125, 100);
}
