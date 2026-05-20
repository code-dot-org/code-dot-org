// Adapter between Java Lab's legacy flat source shape and codebridge's
// MultiFileSource. The flat shape is what lives in S3 (in main.json under
// `source:`) and what Rails emits as `start_sources`. Codebridge wants
// MultiFileSource. Conversion happens at exactly two boundaries:
// JavalabSourcesStore (S3 round-trip) and Javalab2View (start_sources at
// mount). These functions are pure.

import {DEFAULT_FOLDER_ID} from '@codebridge/constants';

import {
  FileId,
  MultiFileSource,
  ProjectFile,
  ProjectFileType,
} from '@cdo/apps/lab2/types';

import {JavalabFlatFile, JavalabFlatSource} from './types';

function projectFileType(flat: JavalabFlatFile): ProjectFileType {
  if (flat.isValidation) return ProjectFileType.VALIDATION;
  if (!flat.isVisible) return ProjectFileType.SUPPORT;
  return ProjectFileType.STARTER;
}

export function flatToMultiFile(
  flat: JavalabFlatSource | null | undefined
): MultiFileSource {
  if (!flat || Object.keys(flat).length === 0) {
    return {folders: {}, files: {}, openFiles: []};
  }

  const entries = Object.entries(flat);
  const files: Record<FileId, ProjectFile> = {};
  const idByName = new Map<string, FileId>();

  // IDs must be numeric strings — codebridge's getNextFileId allocates new
  // IDs as `String(max(Number(existingId)) + 1)`, so any non-numeric prefix
  // here would make Number(id) === NaN and every newly-allocated id would
  // collide on 'NaN'.
  entries.forEach(([name, props], i) => {
    const id = String(i);
    idByName.set(name, id);
    files[id] = {
      id,
      name,
      contents: props.text ?? '',
      folderId: DEFAULT_FOLDER_ID,
      type: projectFileType(props),
    };
  });

  // Visible, non-validation files become tabs, ordered by legacy tabOrder.
  // Ties and missing tabOrders fall back to original key order.
  const visible = entries
    .map(([name, props], i) => ({name, props, i}))
    .filter(e => e.props.isVisible && !e.props.isValidation);
  visible.sort((a, b) => {
    const tabA = resolveTabOrder(a.props.tabOrder, a.i);
    const tabB = resolveTabOrder(b.props.tabOrder, b.i);
    if (tabA !== tabB) return tabA - tabB;
    return a.i - b.i;
  });
  const openFiles = visible
    .map(e => idByName.get(e.name))
    .filter((id): id is FileId => !!id);

  return {folders: {}, files, openFiles};
}

// tabOrder is optional on the legacy shape and can be missing, NaN, or
// duplicated across files. Fall back to the file's position in the source
// hash when it isn't a usable finite number.
function resolveTabOrder(
  tabOrder: number | undefined,
  fallback: number
): number {
  return typeof tabOrder === 'number' && Number.isFinite(tabOrder)
    ? tabOrder
    : fallback;
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
