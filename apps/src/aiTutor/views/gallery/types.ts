import {ResponseValidator} from '../../../util/HttpClient';
import {
  ChallengeResponse,
  challengeResponseValidator,
} from '../lessonDeepDive/types';

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

// An emoji reaction on a project and how many classmates left it.
export type Reaction = {
  emoji: string;
  count: number;
};

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
