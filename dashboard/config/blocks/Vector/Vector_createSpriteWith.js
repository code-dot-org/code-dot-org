function createSpriteWith(callback) {
  console.log(123);
  console.log(callback);
  console.log(createSprite);
  callback.apply(createSprite());
}