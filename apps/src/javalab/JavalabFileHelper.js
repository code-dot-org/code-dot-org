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

  Object.keys(sources).forEach(file => {
    if (sources[file].isVisible || isEditingStartSources) {
      // tabIndex should be the length of orderedTabKeys, not the index
      // from the list, because we skip hidden files in the tabs.
      const tabIndex = orderedTabKeys.length;
      let tabKey = getTabKey(tabIndex);
      fileMetadata[tabKey] = file;
      orderedTabKeys.push(tabKey);
    }
  });

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
