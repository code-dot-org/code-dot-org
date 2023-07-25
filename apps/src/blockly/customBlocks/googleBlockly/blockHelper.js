export function changeShadowedImage(
  parentBlock,
  childBlock,
  imageIndexOnParent
) {
  const imageUrl = parentBlock
    .getChildren(true)[0]
    .inputList[0].fieldRow[imageIndexOnParent].imageElement_.getAttribute(
      'xlink:href'
    );
  const textInput = childBlock.inputList[0].fieldRow[0];
  const previewInput = childBlock.inputList[0].fieldRow[1];
  textInput.setValue(childBlock.shortString);
  previewInput.setValue(imageUrl);
  previewInput.updateDimensions(
    childBlock.thumbnailSize,
    childBlock.thumbnailSize
  );
  previewInput.getSize();
}

export function resetShadowedImageToLongString(childBlock) {
  const textInput = childBlock.inputList[0].fieldRow[0];
  const previewInput = childBlock.inputList[0].fieldRow[1];
  textInput.setValue(childBlock.longString);
  previewInput.setValue('');
  previewInput.updateDimensions(1, childBlock.thumbnailSize);
  previewInput.getSize();
}
