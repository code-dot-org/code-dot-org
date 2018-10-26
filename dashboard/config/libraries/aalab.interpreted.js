/*jshint esversion: 6 */
let box = createSprite(200,200);
let spriteGroups = {};

function setColor(color){
  box.shapeColor = color;
}

function createSpriteGroup(groupName) {
  spriteGroups.groupName = new Group();
}

function addToSpriteGroup(sprite, groupName) {
  sprite.addToGroup(spriteGroups.groupName);
}

function draw(){
  drawSprites();
}