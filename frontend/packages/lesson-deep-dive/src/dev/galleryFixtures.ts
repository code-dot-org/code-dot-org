// Bootstrap and endpoint fixtures for the Tutor+ project gallery dev entry.
// Source: LessonsController#tutor_gallery for tutorGalleryData;
// ChallengeResponsesController#show and ChallengeResponse#summarize
// (dashboard/app/models/challenge_response.rb) for the challenge_responses
// wire shape. See README.md's gallery section for how to harvest a real
// payload and regenerate this.

export interface GalleryUnit {
  id: number;
  name: string;
  position: number;
  link: string;
}

export interface GallerySection {
  id: number;
  name: string;
}

export interface TutorGalleryData {
  currentUnitId: number;
  units: GalleryUnit[];
  sections: GallerySection[];
}

export const TUTOR_GALLERY_DATA: TutorGalleryData = {
  currentUnitId: 1,
  units: [
    {id: 1, name: 'Talking to Machines', position: 1, link: '/s/aif1-v2-2025'},
    {id: 2, name: 'Bias and Fairness', position: 2, link: '/s/aif2-v2-2025'},
  ],
  sections: [
    {id: 100, name: 'Period 3 - AI Foundations'},
    {id: 101, name: 'Period 6 - AI Foundations'},
  ],
};

export interface GalleryAsset {
  id: number;
  asset_type: 'whiteboard_image' | 'video' | 'audio';
  download_url: string | null;
}

// The wire shape of a GET /challenge_responses list row: summarize() without
// include_feedback, which is how the gallery lists everyone but the caller's
// own rows. student_feedback is not just null here, the key is absent — the
// detail transform in galleryMocks.ts adds it back for owner/teacher.
export interface GalleryChallengeResponse {
  id: number;
  challenge_id: number;
  user_id: number;
  user_name: string;
  unit_id: number | null;
  lesson_position: number | null;
  student_text: string | null;
  transcript: string | null;
  evaluation_status: string | null;
  is_final: boolean;
  created_at: string;
  assets: GalleryAsset[];
}

export interface RubricEntry {
  level: number;
  description: string;
}

export interface EvaluationResult {
  level: number;
  reasoning: string;
  evidence: string;
  student_feedback: string;
}

export interface Challenge {
  question: string;
  rubric: RubricEntry[];
}

const RUBRIC_VIDEO: RubricEntry[] = [
  {
    level: 0,
    description: 'No video was recorded, or it does not answer the prompt.',
  },
  {
    level: 1,
    description:
      'Names a term from the lesson but does not explain how it works.',
  },
  {
    level: 2,
    description: 'Explains the idea correctly but without a concrete example.',
  },
  {
    level: 3,
    description:
      'Explains the idea correctly and grounds it in a specific example.',
  },
];

const RUBRIC_WHITEBOARD: RubricEntry[] = [
  {
    level: 0,
    description: 'No diagram was drawn, or it does not relate to the prompt.',
  },
  {
    level: 1,
    description:
      'Diagram has the right pieces but the flow between them is unclear.',
  },
  {
    level: 2,
    description:
      'Diagram is correct and mostly explained in the caption or narration.',
  },
  {
    level: 3,
    description:
      'Diagram is correct and the caption or narration explains why each step happens.',
  },
];

export const CHALLENGES: Record<number, Challenge> = {
  501: {
    question:
      'Record a short video explaining how an AI chatbot predicts the next word in a sentence.',
    rubric: RUBRIC_VIDEO,
  },
  502: {
    question:
      'Sketch a diagram of how a prompt becomes an AI response, then explain your diagram.',
    rubric: RUBRIC_WHITEBOARD,
  },
  503: {
    question:
      'Diagram how a recommendation algorithm can show two different users different results for the same search, and explain why.',
    rubric: RUBRIC_WHITEBOARD,
  },
};

// A fixture response plus the fields only GET /challenge_responses/:id
// exposes, and only to some roles — the sectionId that scopes it into the
// class gallery, and the async evaluation the AI job would have written.
// evaluation.student_feedback is what the response row's own
// student_feedback column is copied from (see EvaluateChallengeResponseJob).
export interface FixtureResponse extends GalleryChallengeResponse {
  sectionId: number;
  evaluation: EvaluationResult | null;
  evaluatedAt: string | null;
}

export const FIXTURE_RESPONSES: FixtureResponse[] = [
  {
    id: 601,
    challenge_id: 501,
    sectionId: 100,
    user_id: 9001,
    user_name: 'Ava Chen',
    unit_id: 1,
    lesson_position: 1,
    student_text: null,
    transcript:
      'The AI looks at huge amounts of text and learns which words tend to follow each other, so it predicts the next word based on probability, not real understanding.',
    evaluation_status: 'success',
    is_final: true,
    created_at: '2026-08-18T15:04:00.000Z',
    assets: [
      {id: 701, asset_type: 'video', download_url: '/gallery/sample-video.mp4'},
    ],
    evaluation: {
      level: 3,
      reasoning:
        'The student correctly describes next-word prediction as probability over training text and gives a worked example.',
      evidence:
        '"it predicts the next word based on probability, not real understanding" — names the mechanism and distinguishes it from understanding.',
      student_feedback:
        'Great explanation! You clearly described how the model predicts words from patterns in its training text, and your example made the idea concrete.',
    },
    evaluatedAt: '2026-08-18T15:06:00.000Z',
  },
  {
    id: 602,
    challenge_id: 502,
    sectionId: 100,
    user_id: 9002,
    user_name: 'Marcus Webb',
    unit_id: 1,
    lesson_position: 1,
    student_text:
      "I drew a box for my prompt, an arrow into the AI model, and an arrow out to the response. The AI box has smaller boxes inside for 'patterns' and 'probability' because that's how it picks words.",
    transcript: null,
    evaluation_status: 'success',
    is_final: true,
    created_at: '2026-08-17T13:30:00.000Z',
    assets: [
      {
        id: 702,
        asset_type: 'whiteboard_image',
        download_url: '/gallery/sample-whiteboard.png',
      },
    ],
    evaluation: {
      level: 2,
      reasoning:
        'Diagram and caption are correct and cover the full prompt-to-response flow, but do not explain why probability picks one word over another.',
      evidence:
        "\"smaller boxes inside for 'patterns' and 'probability'\" names the mechanism without explaining how it selects a word.",
      student_feedback:
        'Nice work laying out the whole flow from prompt to response. Next time, try explaining why probability favors one word over another.',
    },
    evaluatedAt: '2026-08-17T13:35:00.000Z',
  },
  {
    id: 603,
    challenge_id: 502,
    sectionId: 100,
    user_id: 9003,
    user_name: 'Priya Patel',
    unit_id: 1,
    lesson_position: 1,
    student_text: null,
    transcript: null,
    evaluation_status: 'queued',
    is_final: true,
    created_at: '2026-08-19T09:12:00.000Z',
    assets: [
      {
        id: 703,
        asset_type: 'whiteboard_image',
        download_url: '/gallery/sample-whiteboard.png',
      },
    ],
    // Submitted after the others; the async evaluation job has not run yet —
    // the msw fixture, not the app, models that lag.
    evaluation: null,
    evaluatedAt: null,
  },
  {
    id: 604,
    challenge_id: 501,
    sectionId: 100,
    user_id: 9004,
    user_name: 'Leo Kim',
    unit_id: 1,
    lesson_position: 1,
    student_text: null,
    transcript:
      "I said the AI doesn't actually know anything, it just guesses the most likely next word based on the huge amount of text it was trained on, like autocomplete but much bigger.",
    evaluation_status: 'success',
    is_final: true,
    created_at: '2026-08-16T10:45:00.000Z',
    assets: [
      {id: 704, asset_type: 'video', download_url: '/gallery/sample-video.mp4'},
    ],
    evaluation: {
      level: 3,
      reasoning:
        'Correctly frames prediction as pattern-based guessing rather than knowledge, with a well-chosen analogy.',
      evidence:
        '"like autocomplete but much bigger" — an apt, specific comparison that shows real understanding.',
      student_feedback:
        'Excellent explanation, and the autocomplete comparison really helps show how the model works.',
    },
    evaluatedAt: '2026-08-16T10:48:00.000Z',
  },
  {
    id: 605,
    challenge_id: 503,
    sectionId: 100,
    user_id: 9005,
    user_name: 'Sofia Nguyen',
    unit_id: 2,
    lesson_position: 1,
    student_text:
      'My diagram shows the same search going into two different user profiles, then two different result lists coming out, because the algorithm uses each person’s past clicks.',
    transcript: null,
    evaluation_status: 'success',
    is_final: true,
    created_at: '2026-08-20T11:00:00.000Z',
    assets: [
      {
        id: 705,
        asset_type: 'whiteboard_image',
        download_url: '/gallery/sample-whiteboard.png',
      },
    ],
    evaluation: {
      level: 2,
      reasoning:
        'Correctly shows personalization branching the same query into different results, without naming what signal drives the branch.',
      evidence:
        '"because the algorithm uses each person\'s past clicks" identifies a plausible signal but the diagram itself does not show it.',
      student_feedback:
        'Good instinct connecting this to personalization. Try adding the click history to your diagram itself, not just the caption.',
    },
    evaluatedAt: '2026-08-20T11:04:00.000Z',
  },
  {
    id: 606,
    challenge_id: 501,
    sectionId: 101,
    user_id: 9006,
    user_name: 'Owen Brooks',
    unit_id: 1,
    lesson_position: 1,
    student_text: null,
    transcript:
      'AI predicts text by looking at probability, so more common word pairings show up more often in its answers.',
    evaluation_status: 'success',
    is_final: true,
    created_at: '2026-08-15T08:20:00.000Z',
    assets: [
      {id: 706, asset_type: 'video', download_url: '/gallery/sample-video.mp4'},
    ],
    evaluation: {
      level: 2,
      reasoning:
        'Names probability correctly but the explanation stays generic, with no example.',
      evidence:
        '"more common word pairings show up more often" restates the mechanism without a worked example.',
      student_feedback:
        'You named the right idea — probability over word pairs. Try walking through one example prompt to make it concrete.',
    },
    evaluatedAt: '2026-08-15T08:23:00.000Z',
  },
];
