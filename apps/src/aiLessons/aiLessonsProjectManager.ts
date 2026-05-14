// Minimal ProjectManager that intercepts `save()` calls from lab2 views
// (codebridge's setAndSaveProjectSources thunk for Weblab2, and MusicView's
// saveCode for Music) and persists the project sources to our AI Lessons
// backend under `dashboard/tmp/ai_lessons/sources/<lessonId>/<labType>.json`.
//
// Also dispatches into our private `aiLessonsSources` slice on every save
// so useStudentWork can feed the latest Blockly/web source to the AI Tutor.
// We deliberately do NOT dispatch into `state.lab2Project` — MusicView's
// componentDidUpdate watches that and reloads the Blockly workspace on
// change, which creates a feedback loop with our save (clearCode/Start
// Over in particular ends up reloading the post-cleared workspace
// repeatedly).
//
// Implements only the surface lab2 actually invokes — save() and
// setLastSource() — and returns Response shapes shaped enough to satisfy
// the lab2 code paths that look at them.

import {ProjectSources} from '@cdo/apps/lab2/types';
import {getStore} from '@cdo/apps/redux';
import HttpClient from '@cdo/apps/util/HttpClient';

import {setSavedSource} from './aiLessonsSourcesRedux';

const SAVE_DEBOUNCE_MS = 750;

export class AiLessonsProjectManager {
  private readonly url: string;
  private readonly labType: string;
  private lastSource: ProjectSources | undefined;
  private pending: ProjectSources | undefined;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private inFlight: Promise<void> | undefined;
  private destroyed = false;

  constructor(lessonId: string, labType: string) {
    this.labType = labType;
    this.url = `/ai_lessons/${encodeURIComponent(
      lessonId
    )}/sources/${encodeURIComponent(labType)}`;
  }

  // Lab2 callers expect a Promise<Response>.  We resolve to an empty 204 on
  // success and treat thrown errors as save failures, but we always settle
  // so callers never hang.
  async save(sources: ProjectSources, forceSave = false): Promise<Response> {
    if (this.destroyed) return new Response(null, {status: 204});
    this.pending = sources;
    // Push into our private slice so useStudentWork sees the latest
    // source without going through lab2Project (which Music watches and
    // would reload-loop on).
    getStore().dispatch(setSavedSource({labType: this.labType, sources}));
    if (forceSave) {
      return this.flush();
    }
    this.scheduleFlush();
    return new Response(null, {status: 204});
  }

  // Used by codebridge's useSource on initial load to prime the manager
  // with what the workspace currently has, so subsequent diff-based saves
  // know what they're comparing against.
  setLastSource(sources: ProjectSources) {
    this.lastSource = sources;
  }

  getLastSource() {
    return this.lastSource;
  }

  // Force-flush any queued save and tear the manager down.  Call when the
  // student navigates to a different lab type so we don't keep writing for
  // a checkpoint that's no longer active.
  async destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    if (this.pending) await this.flush();
  }

  private scheduleFlush() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.flush();
    }, SAVE_DEBOUNCE_MS);
  }

  private async flush(): Promise<Response> {
    if (!this.pending) return new Response(null, {status: 204});
    const body = this.pending;
    this.pending = undefined;
    // If a flush is already in flight, await it before starting the next.
    if (this.inFlight) await this.inFlight;
    const run = (async () => {
      try {
        await HttpClient.put(this.url, JSON.stringify(body), true, {
          'Content-Type': 'application/json',
        });
        this.lastSource = body;
      } catch (e) {
        // Re-queue so the next save attempt picks this up.  Log and move
        // on — losing a hackathon save isn't fatal.
        this.pending = body;

        console.warn('AiLessonsProjectManager save failed', e);
      }
    })();
    this.inFlight = run;
    await run;
    this.inFlight = undefined;
    return new Response(null, {status: 204});
  }
}

// Fetches the saved project sources for a (lessonId, labType) pair, or
// undefined if nothing has been saved yet.
export async function loadSavedSources(
  lessonId: string,
  labType: string
): Promise<ProjectSources | undefined> {
  const url = `/ai_lessons/${encodeURIComponent(
    lessonId
  )}/sources/${encodeURIComponent(labType)}`;
  try {
    const response = await HttpClient.get(url);
    return (await response.json()) as ProjectSources;
  } catch {
    return undefined;
  }
}
