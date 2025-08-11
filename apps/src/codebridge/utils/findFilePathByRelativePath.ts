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

  // Split the new path into segments
  const newPathSegments = filePath.split('/');

  // If the path is relative, we will resolve it against the current directory.
  // We start with the current directory split into segments, ignoring the current file name.
  const resolvedPathSegments = currentDir ? currentDir.split('/') : [];

  // Process each segment
  for (const segment of newPathSegments) {
    if (segment === '..') {
      // Go up one directory
      resolvedPathSegments.pop();
    } else if (segment !== '.' && segment !== '') {
      // Add segment (ignore current directory '.' and empty segments)
      resolvedPathSegments.push(segment);
    }
  }

  return resolvedPathSegments.join('/');
};
