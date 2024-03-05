// NOTE: min and max are inclusive
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Requires two arrays
export function arrayEquals(a, b) {
  if (a.length !== b.length) {
    return false;
  } // compare the value of each element in the array

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

// Creates and returns a helper object that represents the outer bounds of a sprite.
// Used for comparing the positions of sprites. For example, checking whether
// one sprite is "standing" on top of another.
export function createSpriteCollider(sprite) {
  return {
    top: sprite.y - sprite.height * sprite.scale,
    bottom: sprite.y + sprite.height * sprite.scale,
    left: sprite.x - sprite.width * sprite.scale,
    right: sprite.x + sprite.width * sprite.scale,
  };
}
