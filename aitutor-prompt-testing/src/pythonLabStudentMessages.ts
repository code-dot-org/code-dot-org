/**
 * Realistic student messages for each (level × state) combination.
 * Two variants per entry:
 *   - studentMessage: student asks for help naturally, no explicit video request
 *   - studentMessageVideoRequested: student explicitly asks for a video
 *
 * These are merged into the studio data at runtime by main.ts.
 * Key: `${levelId}_${StudioStateEnum}`
 */
export const pythonLabStudentMessages: Record<
  string,
  {studentMessage: string; studentMessageVideoRequested: string}
> = {
};
