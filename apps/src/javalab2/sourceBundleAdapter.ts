// Javabuilder's HTTP and WebSocket protocols predate codebridge's
// MultiFileSource shape. The server's UserFileData deserializer expects each
// file value to be a small object (`{text, isVisible, tabOrder}`) — the same
// shape the legacy `getSources` redux selector produced. We flatten a
// MultiFileSource down to that shape so the existing Javabuilder backend
// works unchanged.
//
// In the legacy world the validation filenames were obscured before the
// bundle was sent to the client, so name collisions between user files and
// validation files could not happen. The lab2 shape exposes both file lists
// on the client, so we now have to detect collisions ourselves; we throw if
// any are found rather than silently dropping a file.
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

export interface JavabuilderFileEntry {
  text: string;
  isVisible: boolean;
  tabOrder: number;
}

export interface JavabuilderSourceBundle {
  sources: Record<string, JavabuilderFileEntry>;
  validation: Record<string, JavabuilderFileEntry>;
}

export class FileNameCollisionError extends Error {
  constructor(name: string) {
    super(
      `Java Lab cannot run: '${name}' is used as both a starter and a validation file.`
    );
    this.name = 'FileNameCollisionError';
  }
}

export const flattenForJavabuilder = (
  source: MultiFileSource
): JavabuilderSourceBundle => {
  const sources: Record<string, JavabuilderFileEntry> = {};
  const validation: Record<string, JavabuilderFileEntry> = {};
  // tabOrder is positional within each bucket; codebridge's openFiles array
  // gives a stable ordering for visible files, but for the Javabuilder wire
  // we just assign sequential indices in iteration order.
  let sourceIdx = 0;
  let validationIdx = 0;
  Object.values(source.files).forEach(file => {
    const entry: JavabuilderFileEntry = {
      text: file.contents,
      // VALIDATION/SUPPORT files are normally hidden in the editor anyway;
      // we surface every starter file by default to mirror legacy behavior.
      isVisible: file.type !== ProjectFileType.SUPPORT,
      tabOrder: 0,
    };
    if (file.type === ProjectFileType.VALIDATION) {
      if (sources[file.name] !== undefined) {
        throw new FileNameCollisionError(file.name);
      }
      entry.tabOrder = validationIdx++;
      validation[file.name] = entry;
    } else if (
      file.type === undefined ||
      file.type === ProjectFileType.STARTER ||
      file.type === ProjectFileType.LOCKED_STARTER ||
      file.type === ProjectFileType.SUPPORT
    ) {
      if (validation[file.name] !== undefined) {
        throw new FileNameCollisionError(file.name);
      }
      entry.tabOrder = sourceIdx++;
      sources[file.name] = entry;
    }
    // SYSTEM_SUPPORT files (e.g. neighborhood maze) are intentionally
    // omitted from the user-source bundle; Javabuilder rebuilds them from
    // level data on the server side.
  });
  return {sources, validation};
};
