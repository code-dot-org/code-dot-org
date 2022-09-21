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
  /*
  'sources' contains file information as key-value pairs.
  The key is the file name such as 'Class1.java'.
  The value is a file object with the keys: text (source code),
  tabOrder (order of the file tab in orderedTabs from 0 to (number of files - 1)),
  isVisible, and isValidation (default is false)
  The orderOfFiles array will contain the 'fileOrder' of each file as they are assigned
  their tabKey names (such as 'file-0', 'file-1') which is stored in fileMetadata.
  For example, if sources contains the following:
  {
    'Class1.java': {text: '', tabOrder: 2, isVisible: true},
    'Class2.java': {text: '', tabOrder: 0, isVisible: true},
    'Class3.java': {text: '', tabOrder: 1, isVisible: true}
  },
  then depending on how Object.keys iterates through the keys on sources, we could have
  fileMetadata assigned: {'file-0': 'Class2.java', 'file-1': 'Class1.java', 'file-2': 'Class3.java'}.
  The corresponding orderOfFiles would be [0, 2, 1], unorderedTabKeys would be ['file-0', 'file-1', 'file-2],
  and orderedTabKeys would be ['file-0', 'file-2', 'file-1'].
  */
  let fileMetadata = {};
  let orderedTabKeys = [];
  let unorderedTabKeys = [];
  let orderOfFiles = [];
  let fileIndex = 0;
  let isValid = true;
  Object.keys(sources).forEach(fileName => {
    if (sources[fileName].isVisible || isEditingStartSources) {
      let fileTabKey = getTabKey(fileIndex);
      fileMetadata[fileTabKey] = fileName;
      unorderedTabKeys.push(fileTabKey);
      let tabOrder = sources[fileName].tabOrder;
      // files that are stored may not currently have an tabOrder assigned so that
      // order is undefined
      if (Number.isInteger(tabOrder)) {
        orderOfFiles.push(sources[fileName].tabOrder);
      } else {
        isValid = false;
      }
      fileIndex++;
    }
  });
  const numTotalFiles = fileIndex;
  // check orderOfFiles for duplicates
  isValid = isValid && new Set(orderOfFiles).size === orderOfFiles.length;

  /*
  Assign orderedTabKeys the ordering of files stored in orderOfFiles corresponding to
  file names stored in fileMetadata.
  There may be missing tab orders due to validation or support files saved in start_sources
  mode that are not included outside of start_sources mode.
  For example, if a levelbuilder created a support file, validation file and 2 starter files,
  and ordered the file tabs as: 'Validation.java', 'Starter1.java', 'Support.java', 'Starter2.java',
  then the corresponding tabOrders for each file would be: 0, 1, 2, 3. When isEditingStartSources
  is false, only 'Start1.java' and 'Starter2.java' would be loaded into sources with
  the corredponding tabOrders would be 1, 3.
  If isValid is false due to duplicate tabOrders or any undefined tabOrders, then
  assign orderedTabKeys the order ['file-0', 'file-1', 'file-2', ...]
  */
  if (isValid) {
    let fileCount = 0;
    let tabOrder = 0;
    while (fileCount < numTotalFiles) {
      let fileIndex = orderOfFiles.indexOf(tabOrder);
      if (fileIndex > -1) {
        orderedTabKeys.push(unorderedTabKeys[fileIndex]);
        fileCount++;
      }
      tabOrder++;
    }
  } else {
    for (let fileIndex = 0; fileIndex < numTotalFiles; fileIndex++) {
      orderedTabKeys.push(getTabKey(fileIndex));
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
