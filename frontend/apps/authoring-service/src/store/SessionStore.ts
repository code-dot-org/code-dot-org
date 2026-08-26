import fs from 'node:fs';
import path from 'node:path';

import {LEVEL_ID_PATTERN, WIDGET_ID_PATTERN} from '../authoring/model.js';
import type {
  CourseModel,
  CurriculumChange,
  WidgetDescriptor,
} from '../authoring/model.js';
import type {MazeLevelDefinition} from '../levels/mazeLevel.js';

export type ChatRole = 'author' | 'agent' | 'status';

export interface ChatScope {
  courseId?: string;
  unitId?: string;
  lessonId?: string;
  experienceId?: string;
  /** Author clicked an insertion point: where new experiences should land. */
  insertPosition?: number;
}

export interface ChatMessage {
  id: string;
  at: string;
  role: ChatRole;
  text: string;
  scope?: ChatScope;
}

/** Everything `curriculum.json` holds. */
export interface CurriculumSnapshot {
  version: number;
  courses: CourseModel[];
  widgets: WidgetDescriptor[];
  levelProperties: Record<string, Record<string, unknown>>;
}

export const EMPTY_SNAPSHOT: CurriculumSnapshot = {
  version: 0,
  courses: [],
  widgets: [],
  levelProperties: {},
};

/**
 * File-backed draft persistence for one authoring session. Single process, no
 * locking: every mutation writes through before it is reported as applied, so a
 * restart resumes from disk without a replay step.
 */
export class SessionStore {
  readonly root: string;

  constructor(root: string) {
    this.root = root;
    fs.mkdirSync(this.widgetsDir, {recursive: true});
  }

  /** `frontend/.authoring/sessions/<sessionId>/`. */
  static forSession(frontendRoot: string, sessionId: string): SessionStore {
    return new SessionStore(
      path.join(frontendRoot, '.authoring', 'sessions', sessionId),
    );
  }

  get curriculumFile(): string {
    return path.join(this.root, 'curriculum.json');
  }

  get changesFile(): string {
    return path.join(this.root, 'changes.jsonl');
  }

  get chatFile(): string {
    return path.join(this.root, 'chat.jsonl');
  }

  get widgetsDir(): string {
    return path.join(this.root, 'widgets');
  }

  readSnapshot(): CurriculumSnapshot | undefined {
    const raw = readFileIfPresent(this.curriculumFile);
    if (raw === undefined) {
      return undefined;
    }
    let parsed: Partial<CurriculumSnapshot>;
    try {
      parsed = JSON.parse(raw) as Partial<CurriculumSnapshot>;
    } catch (error) {
      // A torn write (crash mid-fsync, disk full) must not brick every
      // future start; fall back to an empty snapshot the same way a missing
      // file does.
      console.error(
        `[authoring-service] ${this.curriculumFile} is not valid JSON, ` +
          `starting from an empty snapshot: ${String(error)}`,
      );
      return undefined;
    }
    return {
      version: parsed.version ?? 0,
      courses: parsed.courses ?? [],
      widgets: parsed.widgets ?? [],
      levelProperties: parsed.levelProperties ?? {},
    };
  }

  writeSnapshot(snapshot: CurriculumSnapshot): void {
    const temp = `${this.curriculumFile}.${process.pid}.tmp`;
    fs.writeFileSync(temp, `${JSON.stringify(snapshot, null, 2)}\n`);
    fs.renameSync(temp, this.curriculumFile);
  }

  readChanges(): CurriculumChange[] {
    return readJsonLines<CurriculumChange>(this.changesFile);
  }

  appendChange(change: CurriculumChange): void {
    appendJsonLine(this.changesFile, change);
  }

  readChat(): ChatMessage[] {
    return readJsonLines<ChatMessage>(this.chatFile);
  }

  appendChatMessage(message: ChatMessage): void {
    appendJsonLine(this.chatFile, message);
  }

  widgetDir(widgetId: string): string {
    this.assertValidWidgetId(widgetId);
    return path.join(this.widgetsDir, widgetId);
  }

  // widgetId flows into path.join for every widget file operation below; an
  // id like `../../../etc/passwd` would otherwise escape widgetsDir for both
  // reads and writes. All four widget file methods route through widgetDir,
  // so this one check covers them.
  private assertValidWidgetId(widgetId: string): void {
    if (!WIDGET_ID_PATTERN.test(widgetId)) {
      throw new Error(`invalid widget id: ${widgetId}`);
    }
  }

  readWidgetSource(widgetId: string): string | undefined {
    return readFileIfPresent(
      path.join(this.widgetDir(widgetId), 'widget.html'),
    );
  }

  writeWidgetSource(widgetId: string, html: string): void {
    const dir = this.widgetDir(widgetId);
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(path.join(dir, 'widget.html'), html);
  }

  writeWidgetDescriptor(descriptor: WidgetDescriptor): void {
    const dir = this.widgetDir(descriptor.id);
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(
      path.join(dir, 'meta.json'),
      `${JSON.stringify(descriptor, null, 2)}\n`,
    );
  }

  get levelsDir(): string {
    return path.join(this.root, 'levels');
  }

  levelDir(levelId: string): string {
    this.assertValidLevelId(levelId);
    return path.join(this.levelsDir, levelId);
  }

  // Same reasoning as assertValidWidgetId: levelId flows into path.join for
  // every level file operation below.
  private assertValidLevelId(levelId: string): void {
    if (!LEVEL_ID_PATTERN.test(levelId)) {
      throw new Error(`invalid level id: ${levelId}`);
    }
  }

  readLevelDefinition(levelId: string): MazeLevelDefinition | undefined {
    const raw = readFileIfPresent(
      path.join(this.levelDir(levelId), 'level.json'),
    );
    return raw === undefined
      ? undefined
      : (JSON.parse(raw) as MazeLevelDefinition);
  }

  writeLevelDefinition(levelId: string, definition: MazeLevelDefinition): void {
    const dir = this.levelDir(levelId);
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(
      path.join(dir, 'level.json'),
      `${JSON.stringify(definition, null, 2)}\n`,
    );
  }

  /** Returns the path written, so the caller can report it. */
  writePublishArtifact(artifact: unknown, at: Date = new Date()): string {
    const stamp = at.toISOString().replace(/[:.]/g, '-');
    const file = path.join(this.root, `publish-${stamp}.json`);
    fs.writeFileSync(file, `${JSON.stringify(artifact, null, 2)}\n`);
    return file;
  }
}

function readFileIfPresent(file: string): string | undefined {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

function readJsonLines<T>(file: string): T[] {
  const raw = readFileIfPresent(file);
  if (!raw) {
    return [];
  }
  const lines: T[] = [];
  for (const line of raw.split('\n')) {
    if (line.trim().length === 0) {
      continue;
    }
    try {
      lines.push(JSON.parse(line) as T);
    } catch (error) {
      // One torn line (crash mid-append) must not brick every future start;
      // quarantine it and keep the well-formed lines around it.
      console.error(
        `[authoring-service] skipping malformed line in ${file}: ${String(error)}`,
      );
    }
  }
  return lines;
}

function appendJsonLine(file: string, value: unknown): void {
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`);
}
