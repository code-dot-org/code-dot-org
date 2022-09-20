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

export const fileMetadataForEditor = (sources, isEditingStartSources) => {
  let fileMetadata = {};
  let orderedTabKeys = [];
  let unorderedTabKeys = [];
  // sources contains file information as key-value pairs.
  // The key is the file name such as 'MyClass.java'.
  // The value is a file object with the keys: text (source code),
  // order (order of the file tab in orderedTabs from 0 to number of files - 1),
  // isVisible, and isValidation.
  // The orderOfFiles array will contain the 'order' of each file as they are assigned
  // their tabKey names (such as 'file-0', 'file-1') which is stored in fileMetadata
  let orderOfFiles = [];
  let fileIndex = 0; // may be different from index below due to hidden files
  let isValid = true;
  Object.keys(sources).forEach(file => {
    if (sources[file].isVisible || isEditingStartSources) {
      let tabKey = getTabKey(fileIndex);
      fileMetadata[tabKey] = file;
      unorderedTabKeys.push(tabKey);
      let order = sources[file].order;
      // files that are stored may not currently have an order assigned so that order is undefined
      if (Number.isInteger(order)) {
        orderOfFiles.push(sources[file].order);
      } else {
        isValid = false;
      }
      fileIndex++;
    }
  });
  const numVisibleFiles = fileIndex;
  // check orderOfFiles for duplicates, out of bounds, or missing orders
  if (isValid) {
    for (let i = 0; i < numVisibleFiles; i++) {
      if (!orderOfFiles.includes(i)) {
        isValid = false;
      }
    }
  }
  // assign orderedTabKeys the ordering of files stored in orderOfFiles
  // if any of the orders from sources were invalid,
  // (undefined, duplicates, missing orders, out of bounds), assign order based on
  // file metadata
  for (let i = 0; i < numVisibleFiles; i++) {
    if (isValid) {
      let index = orderOfFiles.indexOf(i);
      orderedTabKeys.push(unorderedTabKeys[index]);
    } else {
      orderedTabKeys.push(getTabKey(i));
    }
  }

  const firstTabKey = orderedTabKeys.length > 0 ? orderedTabKeys[0] : null;

  return {
    fileMetadata,
    orderedTabKeys,
    activeTabKey: firstTabKey,
    lastTabKeyIndex: orderedTabKeys.length - 1
  };
};

export const updateAllSourceFileOrders = (
  sources,
  fileMetadata,
  orderedTabKeys
) => {
  for (let i = 0; i < orderedTabKeys.length; i++) {
    let file = orderedTabKeys[i];
    let fileName = fileMetadata[file];
    sources[fileName].order = i;
  }
  return sources;
};

export const isJavaFile = filename => {
  return filename.endsWith('.java');
};
