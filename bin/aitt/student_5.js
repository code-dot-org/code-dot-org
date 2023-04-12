// create the background
var outside = createSprite(200, 200);
outside.setAnimation("mountains");
//create the bike
var bike = createSprite(250, 305);
bike.setAnimation("bike");
// create the alien
var alien = createSprite(100, 300);
alien.setAnimation("alien");
var guitar = createSprite(130,300);
guitar.setAnimation("guitar");
// make the notes
var note1 = createSprite(130,330);
var note2 = createSprite(130,330);
note1.setAnimation("note");
note2.setAnimation("note");
playSound("guitarChord.mp3");
var noteX = 80;
var noteY = 300;

function draw() {
  bike.scale = 0.5;
  alien.scale = 0.6;
  guitar.rotation = 30;
  guitar.scale = 0.45;

  background("white");
  //play the notes and reset the note sprites when the space bar goes down
  if(keyDown("space")){
    var newNote1 = createSprite(noteX + randomNumber(0,60),noteY + randomNumber(0,60));
    newNote1.setAnimation("note");
    var newNote2 = createSprite(noteX + randomNumber(0,60),noteY + randomNumber(0,60));
    newNote2.setAnimation("note");
    stopSound("guitarChord.mp3");
    playSound("guitarChord.mp3");
  }
  //move the bike and play the bell when the arrow keys go down
  if(keyDown("left")){
    stopSound("bell.mp3");
    playSound("bell.mp3");
    bike.x = bike.x - 5;
  }
  if(keyDown("right")){
    stopSound("bell.mp3");
    playSound("bell.mp3");
    bike.x = bike.x + 5;
  }


  drawSprites();
  //make the text
  fill("white");
  textSize(20);
  text("Hi, welcome to my awesome life!", 30, 30);
  text("Press space to play my guitar!", 70, 60);
  text("Press arrows to ride my bike!", 110, 90);


}
