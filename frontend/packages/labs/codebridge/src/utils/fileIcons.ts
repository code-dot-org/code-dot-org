// Maps a file name to its FontAwesome icon, matching the file-type icons the
// legacy file tabs / browser show. Ported from the non-levelbuilder path of
// apps/src/codebridge/utils/fileUtils.ts `getFileIconNameAndStyle`; the
// start-mode / ProjectFileType branch (validation/support/locked-starter icons)
// is levelbuilder-only and deferred with the rest of levelbuilder support.

interface FileIcon {
  iconName: string;
  iconStyle: 'solid' | 'regular';
  /** FontAwesome brand icon (rendered with `iconFamily="brands"`). */
  isBrand: boolean;
}

const FILE_TYPE_ICON_MAP: Record<string, FileIcon> = {
  py: {iconName: 'python', iconStyle: 'regular', isBrand: true},
  csv: {iconName: 'file-csv', iconStyle: 'solid', isBrand: false},
  txt: {iconName: 'file-lines', iconStyle: 'solid', isBrand: false},
  md: {iconName: 'markdown', iconStyle: 'regular', isBrand: true},
  html: {iconName: 'file-code', iconStyle: 'solid', isBrand: false},
  js: {iconName: 'js', iconStyle: 'regular', isBrand: true},
  json: {iconName: 'brackets-curly', iconStyle: 'solid', isBrand: false},
  css: {iconName: 'css', iconStyle: 'regular', isBrand: true},
  jpg: {iconName: 'image', iconStyle: 'solid', isBrand: false},
  jpeg: {iconName: 'image', iconStyle: 'solid', isBrand: false},
  png: {iconName: 'image', iconStyle: 'solid', isBrand: false},
  webp: {iconName: 'image', iconStyle: 'solid', isBrand: false},
};

const DEFAULT_ICON: FileIcon = {
  iconName: 'file',
  iconStyle: 'regular',
  isBrand: false,
};

/** The icon for a file, keyed on its extension; a generic file icon otherwise. */
export function getFileIcon(fileName: string): FileIcon {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  return FILE_TYPE_ICON_MAP[extension] ?? DEFAULT_ICON;
}
