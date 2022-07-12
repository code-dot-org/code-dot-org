/**
 * Checks if any sprite has active speech.
 *
 * @return {boolean} Returns true if any sprite has
 *         active speech and false otherwise.
 */
function checkActiveSpeech(spriteIds){
  for (var spriteId in spriteIds) {
    if(getSpeechForSpriteId(spriteId)){
      return true;
    }
  }
  return false;
}

/**
TODO
 * Checks if a clicked sprite causes some sprite to speak in the frame.
 *
 * @return {boolean} Returns true if a clicked sprite
 *         caused speech and false otherwise.
 */
function checkSpriteSay(eventLog, prevEventLogLength){
  // don't know if first if statement this should be in every event check method......
  if (eventLog.length > prevEventLogLength) {
    var currentEvent = eventLog[eventLog.length - 1];
    if (currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) {
      var spriteIds = getSpriteIdsInUse();
      for (var spriteId in spriteIds) {
        if (getSpeechForSpriteId(spriteId) && spriteSpeechRenderedThisFrame(spriteId)) {
          // clicked sprite caused speech in some sprite
          return true;
        }
      }
    }
  }
  return false;
}
/**
TODO
 * Checks if any sprite began to speak in the frame.
 *
 * @return {boolean} Returns true if a sprite
 *         began speech and false otherwise.
 */
function detectNewSpeech(spriteIds){
  for (var spriteId in spriteIds) {
    if (getSpeechForSpriteId(spriteId) && spriteSpeechRenderedThisFrame(spriteId)) {
      // clicked sprite caused speech in some sprite
      return true;
    }
  }
  return false;
}

/**
TODO
 * Checks if a clicked sprite causes some sprite to speak in the frame and returns
 * spriteId that was clicked if so.
 *
 * @return {int} Returns spriteId of the sprite that was
 *         clicked and caused speech in some sprite, -2 if a sprite was clicked
 *		   but didn't cause speech, and -1 otherwise.
 */
function getClickedSpriteIdCausedSpeech(eventLog, prevEventLogLength){
  // don't know if first if statement this should be in every event check method......
  if (eventLog.length > prevEventLogLength) {
    var currentEvent = eventLog[eventLog.length - 1];
    var clickedSpriteId = parseInt(currentEvent.split(" ")[1]);
    if (currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) {
      var spriteIds = getSpriteIdsInUse();
      for (var spriteId in spriteIds) {
        if (getSpeechForSpriteId(spriteId) && spriteSpeechRenderedThisFrame(spriteId)) {
          // clicked sprite caused speech in some sprite
          return clickedSpriteId;
        }
      }
      return -2;
    }
  }
  return -1;
}

/* Validation Commands
  getSpeechForSpriteId(spriteId) {
    return this.getLastSpeechBubbleForSpriteId(spriteId)?.text;
  },
  spriteSpeechRenderedThisFrame(spriteId) {
    return (
      this.getLastSpeechBubbleForSpriteId(spriteId)?.renderFrame ===
      this.currentFrame()
    );
  }
  */