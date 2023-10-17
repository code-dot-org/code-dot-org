// This object maps the pointer block types that shadow images to the image source
// block type they can shadow.
// It also includes the index of the image to shadow in the image source's inputList.
export const spriteLabPointers = {
  gamelab_clickedSpritePointer: {
    imageSourceType: 'gamelab_spriteClicked',
    imageIndex: 0,
  },
  gamelab_newSpritePointer: {
    imageSourceType: 'gamelab_whenSpriteCreated',
    imageIndex: 0,
  },
  gamelab_subjectSpritePointer: {
    imageSourceType: 'gamelab_checkTouching',
    imageIndex: 0,
  },
  gamelab_objectSpritePointer: {
    imageSourceType: 'gamelab_checkTouching',
    imageIndex: 1,
  },
};
