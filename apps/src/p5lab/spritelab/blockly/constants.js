// This object maps the pointer block types that shadow images to the root block type
// they can shadow.
// It also includes the index of the image to shadow in the image source's inputList.
export const spriteLabPointers = {
  gamelab_clickedSpritePointer: {
    expectedRootBlockType: 'gamelab_spriteClicked',
    imageIndex: 0,
  },
  gamelab_newSpritePointer: {
    expectedRootBlockType: 'gamelab_whenSpriteCreated',
    imageIndex: 0,
  },
  gamelab_subjectSpritePointer: {
    expectedRootBlockType: 'gamelab_checkTouching',
    imageIndex: 0,
  },
  gamelab_objectSpritePointer: {
    expectedRootBlockType: 'gamelab_checkTouching',
    imageIndex: 1,
  },
};
