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
}

export interface Checkpoint {
  id: string;
  title: string;
  description: string;
  labType: LabType;
  instructions: string;
  successCriteria: string;
  panels?: PanelSlide[];
}

export interface CheckpointInput {
  description: string;
  labType: LabType;
}

export interface LessonPlan {
  id?: string;
  title: string;
  objective: string;
  introduction: string;
  checkpoints: Checkpoint[];
  authorInputs: {
    objective: string;
    checkpointInputs: CheckpointInput[];
  };
}

export interface LessonIndexEntry {
  id: string;
  title?: string;
  objective?: string;
  updated_at?: string;
}
