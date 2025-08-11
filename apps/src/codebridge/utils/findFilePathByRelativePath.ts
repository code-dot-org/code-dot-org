// Given a file path and the current file (which is a full path), convert the file
// path to a fully qualified path relative to the root folder. This supports both absolute
// and relative paths.
// The returned path will not have a leading slash.
export const findFilePathByRelativePath = (
  filePath: string,
  currentFile: string
) => {
  if (filePath.startsWith('/')) {
    return filePath.substring(1); // remove leading slash
  }
  // Handle relative paths
  const currentDir = currentFile.includes('/')
    ? currentFile.substring(0, currentFile.lastIndexOf('/'))
    : '';

  const newPathSegments = filePath.split('/');
  // If the path is relative, we will resolve it against the current directory.
  // We start with the current directory split into segments, ignoring the current file name.
  const resolvedPathSegments = currentDir ? currentDir.split('/') : [];

  for (const segment of newPathSegments) {
    if (segment === '..' && resolvedPathSegments.length > 0) {
      // Go up one directory if we can. Ignore if at root.
      resolvedPathSegments.pop();
    } else if (segment !== '.' && segment !== '') {
      // Add segment (ignore current directory '.' and empty segments)
      resolvedPathSegments.push(segment);
    }
  }

  return resolvedPathSegments.join('/');
};
