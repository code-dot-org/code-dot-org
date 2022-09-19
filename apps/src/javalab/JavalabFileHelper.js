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
  let orderOfFiles = [];
  let fileIndex = 0; // may different from index below due to hidden files
  Object.keys(sources).forEach((file, index) => {
    if (sources[file].isVisible || isEditingStartSources) {
      let tabKey = getTabKey(fileIndex);
      fileMetadata[tabKey] = file;
      unorderedTabKeys.push(tabKey);
      let order = sources[file].order;
      if (Number.isInteger(order)) {
        orderOfFiles.push(sources[file].order);
      } else {
        orderOfFiles.push(fileIndex);
      }
      fileIndex++;
    }
  });
  for (let i = 0; i < orderOfFiles.length; i++) {
    let index = orderOfFiles.indexOf(i);
    orderedTabKeys.push(unorderedTabKeys[index]);
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
