// Hackathon AI Lessons — shared types.
//
// A LessonPlan is plain JSON stored on the server and rendered by the student
// page.  The "lab types" are limited to weblab2, music, and panels; the first
// two embed an existing standalone project page in an iframe, while "panels"
// is rendered inline as a simple instructional carousel (no project backend
// involved).

export type LabType = 'weblab2' | 'music' | 'panels';

export interface PanelSlide {
  caption: string;
  // Optional illustration shown behind the caption.  Populated either by
  // the AI image generator (uploaded to /level_assets) or by the author
  // pasting a URL directly.
  imageUrl?: string;
}

export interface Checkpoint {
  id: string;
  title: string;
  // Description of what this checkpoint covers — what the student should do,
  // and any context the AI Tutor needs to guide them.  Never shown to the
  // student directly; the tutor turns it into natural language on the fly.
  description: string;
  labType: LabType;
  successCriteria: string;
  panels?: PanelSlide[];
}

export interface LessonPlan {
  id?: string;
  title: string;
  objective: string;
  checkpoints: Checkpoint[];
  authorInputs: {
    // The free-text prompt the author originally typed.  Kept so the
    // author can tweak the prompt and regenerate later.
    prompt: string;
  };
}

export interface LessonIndexEntry {
  id: string;
  title?: string;
  objective?: string;
  updated_at?: string;
}
