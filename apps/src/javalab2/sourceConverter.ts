// Adapter between Java Lab's legacy flat source shape and codebridge's
// MultiFileSource. The flat shape is what lives in S3 (in main.json under
// `source:`) and what Rails emits as `start_sources`. Codebridge wants
// MultiFileSource. Conversion happens at exactly two boundaries:
// JavalabSourcesStore (S3 round-trip) and Javalab2View (start_sources at
// mount). These functions are pure.

import {
  FileId,
  FolderId,
  MultiFileSource,
  ProjectFile,
  ProjectFileType,
  ProjectFolder,
} from '@cdo/apps/lab2/types';

export interface JavalabFlatFile {
  text: string;
  tabOrder: number;
  isVisible: boolean;
  isValidation: boolean;
}

export type JavalabFlatSource = Record<string, JavalabFlatFile>;

export const JAVALAB_ROOT_FOLDER_ID: FolderId = 'root';
export const JAVALAB_ROOT_FOLDER_NAME = 'src';

const EMPTY_MULTI_FILE_SOURCE: MultiFileSource = {
  folders: {
    [JAVALAB_ROOT_FOLDER_ID]: {
      id: JAVALAB_ROOT_FOLDER_ID,
      name: JAVALAB_ROOT_FOLDER_NAME,
      parentId: '0',
    },
  },
  files: {},
  openFiles: [],
};

function projectFileType(flat: JavalabFlatFile): ProjectFileType {
  if (flat.isValidation) return ProjectFileType.VALIDATION;
  if (!flat.isVisible) return ProjectFileType.SUPPORT;
  return ProjectFileType.STARTER;
}

export function flatToMultiFile(
  flat: JavalabFlatSource | null | undefined
): MultiFileSource {
  if (!flat || Object.keys(flat).length === 0) {
    return {...EMPTY_MULTI_FILE_SOURCE, files: {}, openFiles: []};
  }

  const folders: Record<FolderId, ProjectFolder> = {
    [JAVALAB_ROOT_FOLDER_ID]: {
      id: JAVALAB_ROOT_FOLDER_ID,
      name: JAVALAB_ROOT_FOLDER_NAME,
      parentId: '0',
    },
  };

  const entries = Object.entries(flat);
  const files: Record<FileId, ProjectFile> = {};
  const idByName = new Map<string, FileId>();

  entries.forEach(([name, props], i) => {
    const id = `f${i}`;
    idByName.set(name, id);
    files[id] = {
      id,
      name,
      contents: props.text ?? '',
      folderId: JAVALAB_ROOT_FOLDER_ID,
      type: projectFileType(props),
    };
  });

  // Visible, non-validation files become tabs, ordered by legacy tabOrder.
  // Ties and missing tabOrders fall back to original key order.
  const visible = entries
    .map(([name, props], i) => ({name, props, i}))
    .filter(e => e.props.isVisible && !e.props.isValidation);
  visible.sort((a, b) => {
    const ta = Number.isFinite(a.props.tabOrder) ? a.props.tabOrder : a.i;
    const tb = Number.isFinite(b.props.tabOrder) ? b.props.tabOrder : b.i;
    if (ta !== tb) return ta - tb;
    return a.i - b.i;
  });
  const openFiles = visible
    .map(e => idByName.get(e.name))
    .filter((id): id is FileId => !!id);

  return {folders, files, openFiles};
}

function isVisibleForFlatShape(file: ProjectFile): boolean {
  switch (file.type) {
    case ProjectFileType.SUPPORT:
    case ProjectFileType.SYSTEM_SUPPORT:
    case ProjectFileType.VALIDATION:
      return false;
    default:
      return true;
  }
}

export function multiFileToFlat(
  source: MultiFileSource | null | undefined
): JavalabFlatSource {
  if (!source || !source.files) return {};

  const flat: JavalabFlatSource = {};
  const openFiles = source.openFiles ?? [];
  const openIndex = new Map<FileId, number>();
  openFiles.forEach((id, idx) => openIndex.set(id, idx));

  // Open files take tabOrder 0..N-1; closed files get monotonically
  // increasing tabOrders starting at openFiles.length.
  let nextClosedTab = openFiles.length;
  for (const file of Object.values(source.files)) {
    const isVisible = isVisibleForFlatShape(file);
    const isValidation = file.type === ProjectFileType.VALIDATION;
    const tabOrder = openIndex.has(file.id)
      ? (openIndex.get(file.id) as number)
      : nextClosedTab++;
    flat[file.name] = {
      text: file.contents ?? '',
      tabOrder,
      isVisible,
      isValidation,
    };
  }

  return flat;
}
