import {
  ChallengeResponse,
  challengeResponseValidator,
  parseReactions,
  Reaction,
  ResponseValidator,
} from '../types';

// Reactions ride embedded in each ChallengeResponse; re-exported so gallery
// modules can import the type from './types'.
export type {Reaction} from '../types';

// Bootstrap data embedded by LessonsController#tutor_gallery.
export type GalleryUnit = {
  id: number;
  name: string;
  position: number;
  // Path to the unit on studio (e.g. "/s/ai-1"), for building lesson URLs.
  link: string;
};

export type GallerySection = {
  id: number;
  name: string;
};

export type TutorGalleryData = {
  currentUnitId: number;
  units: GalleryUnit[];
  sections: GallerySection[];
};

export type GallerySort = 'recent' | 'oldest';

// This viewer's relationship to a response, decided server-side. It picks
// the project page layout: teachers get the AI assessment panel, owners the
// feedback panel, peers neither.
export type ViewerRole = 'owner' | 'teacher' | 'peer';

// One level of a challenge's rubric. Serialized only to teachers.
export type RubricEntry = {
  level: number;
  description: string;
};

// The stored AI evaluation of a response. Serialized only to teachers.
export type EvaluationResult = {
  level: number;
  reasoning: string;
  evidence: string;
  student_feedback: string;
};

// GET /challenge_responses/:id — a response plus the role-dependent detail
// fields the project page needs. student_feedback and evaluated_at are
// omitted for peers; evaluation_result and rubric are teacher-only.
export type ChallengeResponseDetail = ChallengeResponse & {
  viewer_role: ViewerRole;
  question: string;
  evaluated_at: string | null;
  evaluation_result: EvaluationResult | null;
  rubric: RubricEntry[];
};

type ServerResponseDetail = {
  viewer_role?: string;
  question?: string;
  evaluated_at?: string | null;
  evaluation_result?: EvaluationResult | null;
  rubric?: RubricEntry[] | null;
};

export const challengeResponseDetailValidator: ResponseValidator<
  ChallengeResponseDetail
> = bodyJson => {
  const base = challengeResponseValidator(bodyJson);
  const detail = bodyJson as ServerResponseDetail;
  if (
    detail.viewer_role !== 'owner' &&
    detail.viewer_role !== 'teacher' &&
    detail.viewer_role !== 'peer'
  ) {
    throw new Error('ChallengeResponse detail missing viewer_role');
  }
  return {
    ...base,
    viewer_role: detail.viewer_role,
    question: detail.question ?? '',
    evaluated_at: detail.evaluated_at ?? null,
    evaluation_result: detail.evaluation_result ?? null,
    rubric: detail.rubric ?? [],
  };
};

// GET /challenge_responses/unit_counts returns {unit_id => count} with the
// ids serialized as JSON object keys, i.e. strings.
export const unitCountsValidator: ResponseValidator<
  Record<string, number>
> = bodyJson => {
  if (
    typeof bodyJson !== 'object' ||
    bodyJson === null ||
    Array.isArray(bodyJson)
  ) {
    throw new Error('Expected an object of unit counts');
  }
  return bodyJson as Record<string, number>;
};

// GET /class_gallery_projects — one student's saved project behind a level
// the unit tags for the class gallery. share_path is null for project types
// with no share view; thumbnail_url is null when the lab captured none.
export type ClassGalleryProject = {
  channel: string;
  project_type: string | null;
  name: string | null;
  thumbnail_url: string | null;
  share_path: string | null;
  updated_at: string;
  user_id: number;
  user_name: string;
  unit_id: number;
  lesson_position: number | null;
  lesson_name: string | null;
  script_level_id: number;
  level_position: number | null;
  reactions: Reaction[];
};

type ServerClassGalleryProject = Partial<
  Omit<ClassGalleryProject, 'reactions'>
> & {reactions?: unknown};

export const classGalleryProjectListValidator: ResponseValidator<
  ClassGalleryProject[]
> = bodyJson => {
  if (!Array.isArray(bodyJson)) {
    throw new Error('Expected an array of class gallery projects');
  }
  return (bodyJson as ServerClassGalleryProject[]).map(p => {
    if (
      typeof p.channel !== 'string' ||
      typeof p.user_id !== 'number' ||
      typeof p.unit_id !== 'number' ||
      typeof p.script_level_id !== 'number'
    ) {
      throw new Error('Class gallery project missing an id');
    }
    return {
      channel: p.channel,
      project_type: p.project_type ?? null,
      name: p.name ?? null,
      thumbnail_url: p.thumbnail_url ?? null,
      share_path: p.share_path ?? null,
      updated_at: p.updated_at ?? '',
      user_id: p.user_id,
      user_name: p.user_name ?? '',
      unit_id: p.unit_id,
      lesson_position: p.lesson_position ?? null,
      lesson_name: p.lesson_name ?? null,
      script_level_id: p.script_level_id,
      level_position: p.level_position ?? null,
      reactions: parseReactions(p.reactions),
    };
  });
};
