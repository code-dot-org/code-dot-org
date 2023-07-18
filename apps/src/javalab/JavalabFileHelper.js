import {CsaViewMode} from './constants';

// Get the default file contents for a given filename and viewMode.
// Adds any default imports for the viewMode to the top of a Java file.
export function getDefaultFileContents(filename, viewMode) {
  let defaultFileContents = '';
  if (filename.toLowerCase().endsWith('.java')) {
    if (viewMode === CsaViewMode.NEIGHBORHOOD) {
      defaultFileContents = 'import org.code.neighborhood.*;\n';
    } else if (viewMode === CsaViewMode.THEATER) {
      defaultFileContents =
        'import org.code.theater.*;\nimport org.code.media.*;\n';
    }
  }
  return defaultFileContents;
}

export const getTabKey = index => `file-${index}`;

/**
 * @typedef {Object} FileMetadataAndMore
 * @property {Object.<string, string>} fileMetadata mapping between tab keys and actual file names
 * @property {Array} orderedTabKeys order to display files in editor
 * @property {string} activeTabKey
 * @property {number} lastTabKeyIndex array index of last tab key
 * @example
 * {
 *   fileMetadata: {'file-0': 'ClassOne.java', 'file-1': 'ClassTwo.java', 'file-2': 'ClassThree.java'},
 *   orderedTabKeys: ['file-1', 'file-2', 'file-0'],
 *   activeTabKey: 'file-1',
 *   lastTabKeyIndex: 2
 * }
 */

/**
 * 'sources' contains file information as key-value pairs.
 * The key is the file name such as 'Class1.java'.
 * The value is a file object with the keys: text (source code),
 * tabOrder (order of the file tab in orderedTabs from 0 to (number of files - 1)),
 * isVisible, and isValidation (default is false)
 * The file tabKey names (such as 'file-0', 'file-1') are stored in fileMetadata.
 * For example, if sources contains the following:
 * {
 *   'ClassOne.java': {text: '', tabOrder: 2, isVisible: true},
 *   'ClassTwo.java': {text: '', tabOrder: 0, isVisible: true},
 *   'ClassThree.java': {text: '', tabOrder: 1, isVisible: true}
 * },
 * then depending on how Object.keys iterates through the keys on sources, we could have
 * fileMetadata assigned: {'file-0': 'ClassOne.java', 'file-1': 'ClassTwo.java', 'file-2': 'ClassThree.java'}.
 * and orderedTabKeys would be ['file-1', 'file-2', 'file-0'].
 * @returns {FileMetadataAndMore}
 */
export const fileMetadataForEditor = (sources, isEditingStartSources) => {
  let fileMetadata = {};
  let orderedTabKeys = [];
  let unorderedTabKeys = [];
  let fileIndex = 0;
  let isValid = true;
  Object.keys(sources).forEach(fileName => {
    if (sources[fileName].isVisible || isEditingStartSources) {
      let fileTabKey = getTabKey(fileIndex);
      fileMetadata[fileTabKey] = fileName;
      let tabOrder = sources[fileName].tabOrder;
      // Files that are stored may not currently have an tabOrder assigned so that
      // order is undefined
      // Also check if two files have the same tabOrder. If so, then orderedTabKeys is invalid
      if (
        Number.isInteger(tabOrder) &&
        orderedTabKeys[tabOrder] === undefined
      ) {
        orderedTabKeys[tabOrder] = fileTabKey;
      } else {
        isValid = false;
      }
      unorderedTabKeys.push(fileTabKey);
      fileIndex++;
    }
  });
  /*
  If there were any support or validation files within this level, these invisible
  files are not included in the editor so their tabOrder would be undefined.
  For example, if a level had one validation file with tabOrder 0 and one starter
  file with tabOrder 1, the orderedTabKeys would currently be [undefined, 1].
  Filter out the undefined's next.
  */
  orderedTabKeys = orderedTabKeys.filter(
    fileTabKey => fileTabKey !== undefined
  );

  /*
  In case any of the tabOrders are invalid (undefined or if two files have the same tabOrder),
  the we'll assign orderedTabKeys the unorderedTabKeys array.
  The tabOrders of the files will be updated by the call to updateAllSourceFileOrders
  inside the setAllSourcesAndFileMetadata action.
  */
  if (!isValid) {
    orderedTabKeys = unorderedTabKeys;
  }

  const firstTabKey = orderedTabKeys.length > 0 ? orderedTabKeys[0] : null;

  return {
    fileMetadata,
    orderedTabKeys,
    activeTabKey: firstTabKey,
    lastTabKeyIndex: orderedTabKeys.length - 1,
  };
};

export const updateAllSourceFileOrders = (
  sources,
  fileMetadata,
  orderedTabKeys
) => {
  for (let fileIndex = 0; fileIndex < orderedTabKeys.length; fileIndex++) {
    let fileTabKey = orderedTabKeys[fileIndex];
    let fileName = fileMetadata[fileTabKey];
    sources[fileName].tabOrder = fileIndex;
  }
  return sources;
};

export const isJavaFile = filename => {
  return filename.endsWith('.java');
};
