// Whether a lab can take a backpack file, judged by its extension. The unified panel
// groups files by this and the chip disables its add button on it, so the two have to
// agree on the answer.
export default function isFileTypeSupported(
  fileName: string,
  supportedFileTypes: string[]
) {
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  return !!fileExtension && supportedFileTypes.includes(fileExtension);
}
