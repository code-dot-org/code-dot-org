export const enableUserAddedSelectionContext = (
  appName: string,
  fileUrl: string | undefined
) => {
  // Allow text files (no fileUrl) and image files (fileUrl with image extension)
  if (appName !== 'weblab2') return false;
  if (!fileUrl) return true;
  // Check for image file extensions
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
  return imageExtensions.some(ext => fileUrl.toLowerCase().endsWith(ext));
};
