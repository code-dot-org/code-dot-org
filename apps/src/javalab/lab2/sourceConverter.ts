// Adapter between Java Lab's legacy flat source shape and codebridge's
// MultiFileSource. The flat shape is what lives in S3 (in main.json under
// `source:`) and what Rails emits as `start_sources`. Codebridge wants
// MultiFileSource. Conversion happens at exactly two boundaries:
// JavalabSourcesStore (S3 round-trip) and Javalab2View (start_sources at
// mount). These functions are pure.
//
// Open/active tab state lives on the flat shape as optional `isOpen` and
// `isActive` fields. Both are unknown extras to Javabuilder, which will safely ignore them.

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

  // Visible, non-validation files are potential open tabs, ordered by legacy
  // tabOrder. Ties and missing tabOrders fall back to original key order.
  // Within that set, only files with isOpen !== false make it into openFiles
  // (missing isOpen defaults to true).
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
    .filter(e => e.props.isOpen !== false)
    .map(e => idByName.get(e.name))
    .filter((id): id is FileId => !!id);

  // Honor isActive on the first claiming file in tab order.
  const activeEntry = visible.find(e => e.props.isActive === true);
  if (activeEntry) {
    const activeId = idByName.get(activeEntry.name);
    if (activeId) files[activeId].active = true;
  }

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
    // isOpen is meaningful only for visible non-validation files. For
    // support/validation files we emit false to be explicit.
    const isOpen = isVisible && !isValidation && openIndex.has(file.id);
    flat[file.name] = {
      text: file.contents ?? '',
      tabOrder,
      isVisible,
      isValidation,
      isOpen,
      isActive: file.active === true,
    };
  }

  return flat;
}
