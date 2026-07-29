// Typecheck-only contract for
// @cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob. See the note
// in reactFlowCanvas.d.ts — the real implementation is served at runtime.

export declare function createSketchSnapshotBlob(
  reactFlow: unknown,
): Promise<{blob?: Blob; error?: string}>;
