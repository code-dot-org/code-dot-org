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
  console.log('sources inside fileMetadataForEditor');
  console.log(sources);

  let fileMetadata = {};
  let orderedTabKeys = [];
  let unorderedTabKeys = [];
  let orderOfFiles = [];
  let fileIndex = 0; // may different from index below due to hidden files
  console.log('Object.keys(sources))');
  console.log(Object.keys(sources));
  Object.keys(sources).forEach((file, index) => {
    console.log('file');
    console.log(file);
    console.log('Object.keys(sources[file])');
    console.log(Object.keys(sources[file]));
    console.log('sources[file].order');
    console.log(sources[file].order);
    if (sources[file].isVisible || isEditingStartSources) {
      let tabKey = getTabKey(fileIndex);
      fileMetadata[tabKey] = file;
      unorderedTabKeys.push(tabKey);
      console.log('sources[file]');
      console.log(sources[file]);
      let order = sources[file].order;
      // fix
      if (Number.isInteger(order)) {
        orderOfFiles.push(sources[file].order);
      } else {
        orderOfFiles.push(fileIndex);
      }
      fileIndex++;
    }
  });
  console.log('orderofFiles');
  console.log(orderOfFiles);
  for (let i = 0; i < orderOfFiles.length; i++) {
    let index = orderOfFiles.indexOf(i);
    orderedTabKeys.push(unorderedTabKeys[index]);
  }
  console.log('orderedTabKeys');
  console.log(orderedTabKeys);

  console.log('fileMetadata');
  console.log(fileMetadata);
  const firstTabKey = orderedTabKeys.length > 0 ? orderedTabKeys[0] : null;

  return {
    fileMetadata,
    orderedTabKeys,
    activeTabKey: firstTabKey,
    lastTabKeyIndex: orderedTabKeys.length - 1
  };
};

export const isJavaFile = filename => {
  return filename.endsWith('.java');
};
