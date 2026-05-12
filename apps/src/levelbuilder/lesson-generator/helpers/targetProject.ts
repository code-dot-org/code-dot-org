import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

// The /v3/sources endpoint returns a ProjectSources blob whose `source`
// can be any of several Lab2 source shapes. The lesson generator only
// cares about MultiFileSource (the Weblab2 shape), since the levels it
// produces are weblab2 + panels. Anything else collapses to "no useful
// target" and the AI just doesn't get the extra context.
interface MaybeProjectSources {
  source?: MultiFileSource | string | Record<string, unknown>;
}

function isMultiFileSource(value: unknown): value is MultiFileSource {
  if (!value || typeof value !== 'object') return false;
  const v = value as {files?: unknown; folders?: unknown};
  return typeof v.files === 'object' && typeof v.folders === 'object';
}

// Turn the channel's MultiFileSource into a flat, prompt-friendly listing
// of `path: <body>` blocks. We only include files that the user would
// have authored — starter and source types — and skip the implicit root
// folder's contents that aren't files (folder records, etc).
//
// The returned string is suitable to drop verbatim into a generateText
// prompt as the "final goal" context. Returns null when the response
// shape isn't something we can read (e.g. a Blockly or Excalidraw
// project, or a missing source).
export function formatTargetProject(raw: unknown): string | null {
  const project = raw as MaybeProjectSources | null;
  if (!project || !project.source) return null;
  if (!isMultiFileSource(project.source)) return null;
  const source = project.source;

  // Build a path-from-root for each folder id so file paths read as
  // `js/lib/util.js` rather than `<uuid>/util.js`. The root folder is
  // implicit and lives at id "0".
  const folderPath = new Map<string, string>();
  folderPath.set('0', '');
  // Topologically descend: keep iterating until every folder's parent
  // is resolved or no more progress is made (the latter would mean a
  // cycle, which shouldn't happen for a well-formed source).
  let madeProgress = true;
  while (madeProgress) {
    madeProgress = false;
    for (const id of Object.keys(source.folders || {})) {
      if (folderPath.has(id)) continue;
      const folder = source.folders[id];
      const parent = folderPath.get(folder.parentId);
      if (parent === undefined) continue;
      folderPath.set(id, parent ? `${parent}/${folder.name}` : folder.name);
      madeProgress = true;
    }
  }

  const files = Object.values(source.files || {})
    .filter(f => {
      // Plain user-authored files don't carry a `type`; level-source
      // shapes can carry STARTER or LOCKED_STARTER. Skip the noise
      // types (SUPPORT, VALIDATION, SYSTEM_SUPPORT) — those are not
      // what the AI should be learning from.
      const t = f.type;
      return (
        t === undefined ||
        t === ProjectFileType.STARTER ||
        t === ProjectFileType.LOCKED_STARTER
      );
    })
    .map(f => {
      const dir = folderPath.get(f.folderId) ?? '';
      const path = dir ? `${dir}/${f.name}` : f.name;
      return {path, contents: f.contents};
    })
    .sort((a, b) => a.path.localeCompare(b.path));

  if (files.length === 0) return null;
  return files.map(f => `=== ${f.path} ===\n${f.contents}`).join('\n\n');
}
