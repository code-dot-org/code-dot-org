// create the background
var outside = createSprite(200, 200);
outside.setAnimation("mountains");
//create the bike
var bike = createSprite(250, 305);
bike.setAnimation("bike");
bike.scale = 0.5;
// create the alien
var alien = createSprite(100, 300);
alien.setAnimation("alien");
alien.scale = 0.6;
var guitar = createSprite(130,300);
guitar.setAnimation("guitar");
guitar.rotation = 30;
guitar.scale = 0.45;
// make the notes
var note1 = createSprite(130,330);
var note2 = createSprite(130,330);
note1.setAnimation("note");
note2.setAnimation("note");
playSound("guitarChord.mp3");

var guitar_plays = 0;

function draw() {
  background("white");
  //play the notes and reset the note sprites when the space bar goes down
  if(keyWentDown("space")){
    guitar_plays = guitar_plays + 5;
    note1.x = 130;
    note1.y = 330 - guitar_plays;
    note2.x = 130;
    note2.y = 330 - guitar_plays;
    stopSound("guitarChord.mp3");
    playSound("guitarChord.mp3");
    guitar.y = guitar.y - 5;
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
  //move and wiggle the notes
  note1.rotation = randomNumber(-10,10);
  note2.rotation = randomNumber(-10,10);
  note1.x = note1.x + 1;
  note1.y = note1.y - 2;
  note2.x = note2.x - 1;
  note2.y = note2.y - 2;


  drawSprites();
  //make the text
  fill("white");
  textSize(20);
  text("Hi, welcome to my awesome life!", 30, 30);
  text("Press space to play my guitar!", 70, 60);
  text("Press arrows to ride my bike!", 110, 90);
  if (guitar_plays > 300) {
    textSize(40);
    text("GUITAR MASTER!!!", 30, 180);
  }
}
