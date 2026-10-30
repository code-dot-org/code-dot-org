// Whether a lab can take a backpack file, judged by its extension.
export default function isFileTypeSupported(
  fileName: string,
  supportedFileTypes: string[]
) {
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  return !!fileExtension && supportedFileTypes.includes(fileExtension);
}
