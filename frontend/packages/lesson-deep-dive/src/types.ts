// Structurally identical to apps/src/util/HttpClient's ResponseValidator.
// Defined locally so this package's typecheck never crawls apps' type graph.
export type ResponseValidator<ResponseType> = (
  bodyJson: Record<string, unknown> | unknown[],
) => ResponseType;

export const ExplanationTypes = {
  AUDIO: 'audio',
  TEXT: 'text',
};

export const EvaluationStatus = {
  PENDING: 'pending',
  ERROR: 'error',
  NONE: 'none',
  SUCCESS: 'success',
};

export type ChallengeResponseAsset = {
  id: number;
  asset_type: 'whiteboard_image' | 'video' | 'audio';
  // Presigned S3 URL. Absent right after create, when the bytes have not
  // been uploaded yet.
  download_url: string | null;
};

type ServerChallengeResponseAsset = {
  id: number;
  asset_type: string;
  download_url?: string;
};

// The student-facing shape of a response. student_feedback carries the
// constructive AI feedback (null until evaluation completes) and is private
// to the author: the server omits it on rows belonging to section peers.
// The scored evaluation_result is teacher-only, so it never appears here.
// user_name / unit_id / lesson_position label the work in the gallery.
export type ChallengeResponse = {
  id: number;
  challenge_id: number;
  user_id: number;
  user_name: string;
  unit_id: number | null;
  lesson_position: number | null;
  student_text: string | null;
  transcript: string | null;
  student_feedback: string | null;
  evaluation_status: string | null;
  is_final: boolean;
  created_at: string;
  assets: ChallengeResponseAsset[];
};

type ServerChallengeResponse = {
  id: number;
  challenge_id: number;
  user_id: number;
  user_name?: string;
  unit_id?: number | null;
  lesson_position?: number | null;
  student_text: string | null;
  transcript: string | null;
  student_feedback?: string | null;
  evaluation_status: string | null;
  is_final: boolean;
  created_at: string;
  assets: ServerChallengeResponseAsset[];
};

export const challengeResponseValidator: ResponseValidator<
  ChallengeResponse
> = bodyJson => {
  const r = bodyJson as ServerChallengeResponse;
  if (r.id === undefined) {
    throw new Error('ChallengeResponse missing id');
  }
  return {
    id: r.id,
    challenge_id: r.challenge_id,
    user_id: r.user_id,
    user_name: r.user_name ?? '',
    unit_id: r.unit_id ?? null,
    lesson_position: r.lesson_position ?? null,
    student_text: r.student_text ?? null,
    transcript: r.transcript ?? null,
    student_feedback: r.student_feedback ?? null,
    evaluation_status: r.evaluation_status ?? null,
    is_final: r.is_final,
    created_at: r.created_at,
    assets: r.assets.map(a => ({
      id: a.id,
      asset_type: a.asset_type as ChallengeResponseAsset['asset_type'],
      download_url: a.download_url ?? null,
    })),
  };
};

export const challengeResponseListValidator: ResponseValidator<
  ChallengeResponse[]
> = bodyJson => {
  if (!Array.isArray(bodyJson)) {
    throw new Error('Expected an array of challenge responses');
  }
  return (bodyJson as Record<string, unknown>[]).map(
    challengeResponseValidator,
  );
};

export type Challenge = {
  id: number;
  lesson_id: number;
  question: string;
  default_modality: 'whiteboard' | 'video' | null;
  whiteboard_starter_image_alt_text: string | null;
};

type ServerChallenge = {
  id: number;
  lesson_id: number;
  question: string;
  default_modality: 'whiteboard' | 'video' | null;
  whiteboard_starter_image_alt_text: string | null;
  created_at: string;
  updated_at: string;
};

export const challengeValidator: ResponseValidator<Challenge[]> = bodyJson => {
  if (!Array.isArray(bodyJson)) {
    throw new Error('Expected an array of challenges');
  }
  const challenges = bodyJson as ServerChallenge[];
  for (const c of challenges) {
    if (c.id === undefined) {
      throw new Error('Challenge missing id');
    }
    if (!c.question) {
      throw new Error('Challenge missing question');
    }
  }
  return challenges.map(c => ({
    id: c.id,
    lesson_id: c.lesson_id,
    question: c.question,
    default_modality: c.default_modality ?? null,
    whiteboard_starter_image_alt_text:
      c.whiteboard_starter_image_alt_text ?? null,
  }));
};
