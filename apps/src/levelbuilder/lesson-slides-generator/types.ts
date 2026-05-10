import {Panel} from '@cdo/apps/panels/types';

// Server-side payload, mirrors the shape emitted by Ruby
// Lesson#summarize_for_slides_generate plus the URL-family fields layered
// on by LessonsController#setup_generate_slides.
export interface ExistingLessonData {
  id: number;
  name: string;
  generateSlidesOutline?: string | null;
  slides: PersistedSlide[];
  lessonPath: string;
  editLessonUrl: string;
  // Convenient deep-link to the student-facing /slides viewer for this
  // same lesson, in the URL family the user came in on.
  slidesUrl: string;
}

// One row inside slides.json. `panel` is null until the levelbuilder has
// actually run AI generation for the slide; the description sticks
// around either way so the page can populate the card on reload.
export interface PersistedSlide {
  key: string;
  description: string;
  panel?: Panel | null;
}

// The editable in-memory shape of a slide card. Tracks generation state
// (`generate` / `lastGeneratedDescription`) the same way the parent
// branch's LevelSpec does, so a description edit re-checks the box.
export interface SlideSpec {
  // Stable key for both React lists AND the persisted Panel.key once
  // generated. Reusing one identifier keeps the JSON round-trip simple.
  key: string;
  description: string;
  // Set when an AI generation has succeeded for this slide; cleared
  // when the description has drifted from what we generated for.
  panel?: Panel | null;
  // Whether the next "Generate slides" run should regenerate this slide.
  // Defaults true for fresh cards and any card whose description has
  // drifted from lastGeneratedDescription.
  generate: boolean;
  // The description-as-of-the-last-successful-generation, used to decide
  // whether `generate` should default on or off as the user edits.
  lastGeneratedDescription?: string;
}

// Per-slide progress emitted while the big "Generate slides" run is in
// flight. The dialog draws a progress bar from this.
export interface SlidesProgressUpdate {
  slideIndex: number;
  totalSlides: number;
  phase: 'planning' | 'generating-image' | 'saving';
}

export interface SlidesGenerationSummary {
  generated: {key: string; description: string}[];
  failed: {key: string; description: string; error: string}[];
}
