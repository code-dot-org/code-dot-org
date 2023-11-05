import {SOUND_PREFIX} from '@cdo/apps/assetManagement/assetPrefix';
import _ from 'lodash';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function parseSoundPathString(text) {
  // Example string paths:
  // 'sound://category_board_games/card_dealing_multiple.mp3'
  // 'sound://default.mp3'
  if (!text.startsWith(SOUND_PREFIX) || !text.endsWith('.mp3')) {
    throw new Error('This is not a valid path to a sound file.');
  }
  const pathStringArray = text.split('/');
  let category = '';
  // Some sounds do not include a category, such as default.mp3
  if (pathStringArray[2].includes('category_')) {
    category = pathStringArray[2];
    // Example: 'category_board_games' becomes 'Board games: '
    category = category.replace('category_', '');
    category = category.replace(/_/g, ' ');
    category = capitalizeFirstLetter(category) + ': ';
  }
  // Example: 'card_dealing_multiple.mp3' becomes 'card_dealing_multiple'
  const soundName = pathStringArray[pathStringArray.length - 1].replace(
    '.mp3',
    ''
  );
  // Examples: 'Board games: card_dealing_multiple', 'default'
  const fieldText = `${category}${soundName}`;
  return fieldText;
}

/**
 * Converts a printer-style string range to an array of numbers
 * e.g., "1,2,4-6" becomes [1,2,4,5,6]
 * @param rangeString {string} printer-style range, e.g., "1,2,4-6"
 * @returns  array of numbers
 */
function printerStyleNumberRangeToList(rangeString) {
  const rangeStringNoSpaces = rangeString.replace(/ /g, '');
  const rangeItems = rangeStringNoSpaces.split(',');
  const rangeRegExp = /^(\d+)-(\d+)$/; // e.g., "4-6"
  const numberRegExp = /^(\d+)$/; // e.g., "1", "2"
  const fullNumberList = rangeItems.reduce((numberArray, currExp) => {
    const rangeResult = rangeRegExp.exec(currExp);
    const numberResult = numberRegExp.exec(currExp);
    if (rangeResult) {
      const lowerBound = Number(rangeResult[1]);
      const upperNonInclusiveBound = Number(rangeResult[2]) + 1;
      const rangeArray = _.range(lowerBound, upperNonInclusiveBound);
      numberArray = numberArray.concat(rangeArray);
    } else if (numberResult) {
      numberArray.push(Number(numberResult[1]));
    }
    return numberArray;
  }, []);
  return fullNumberList;
}

/**
 * Converts an array of numbers to a string of numbers separated by commas
 * e.g., [1,2,4,5,6] becomes "1,2,4,5,6", [5] becomes "5"
 * @param numberList array of numbers
 * @returns  numberString {string}
 */
function numberListToString(numberList) {
  let numberString = numberList.reduce((str, curr) => {
    str = str + curr + ',';
    return str;
  }, '');
  if (numberList.length > 0) {
    numberString = numberString.slice(0, -1);
  }
  return numberString;
}

/**
 * @param userBlocks {BlockSvg[]} BlockSvg array from user's workspace
 * @returns array of block objects with four attributes: type, id, nextBlockType, and nextBlockId.
 */
function getUserBlocksWithNextBlock(userBlocks) {
  const userBlocksWithNextBlock = [];
  userBlocks.forEach(b => {
    let block = {type: b.type, id: b.id};
    if (b.childBlocks_[0]) {
      block.nextBlockType = b.childBlocks_[0].type;
      block.nextBlockId = b.childBlocks_[0].id;
    }
    userBlocksWithNextBlock.push(block);
  });
  return userBlocksWithNextBlock;
}

/**
 * This function is used in validation to check for sequencing of blocks in a user's workspace.
 * Specifically, it checks if the searchBlockType is a child block of the topBlockType.
 * @param searchBlockType {string} blockType to search for
 * @param topBlockType {string} blockType to start from
 * @param userBlocks array of block objects with four attributes: type, id, nextBlockType, and nextBlockId.
 * @returns  true if the searchBlockType is a child block of the topBlockType, false otherwise.
 */
function isChildBlockOfTopBlock(searchBlockType, topBlockType, userBlocks) {
  let userBlocksWithNextBlock = getUserBlocksWithNextBlock(userBlocks);
  let currentBlock = userBlocksWithNextBlock.find(b => b.type === topBlockType);
  while (currentBlock?.nextBlockType) {
    if (currentBlock.nextBlockType === searchBlockType) {
      return true;
    }
    currentBlock = userBlocksWithNextBlock.find(
      b => b.id === currentBlock.nextBlockId
    );
  }
  return false;
}

export default {
  capitalizeFirstLetter,
  parseSoundPathString,
  printerStyleNumberRangeToList,
  numberListToString,
  isChildBlockOfTopBlock,
};
