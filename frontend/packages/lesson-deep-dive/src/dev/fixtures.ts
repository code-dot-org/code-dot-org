// Payloads harvested from a local Rails dashboard, so the dev shell and
// Studio render the same props. Source: lessons#tutor for
// /s/aif1-v2-2025/lessons/1/tutor, plus practice_problems#index. Regenerate
// with the queries in README.md if the contract changes.
//
// What Rails sends differs from apps/src/aiTutor/views/lessonDeepDive/types.ts
// (LessonDeepDiveData):
//   - `practiceProblems` and `nextLessonUrl` are declared but never sent.
//   - `objectives[].id` and `vocabulary[].id` are declared string, sent int.
//   - assessmentAnalysis entries carry question_text, student_response and
//     aiReasoning, which the declared AssessmentQuestionResult omits.
// The types below record the wire shape, not the declared one.

interface RailsAssessmentQuestionResult {
  level_id: number;
  script_level_id: number;
  attempts: number;
  correct: boolean;
  question_text: string;
  student_response: string;
  evaluation: string | null;
  aiReasoning: string | null;
}

export interface RailsLessonDeepDiveData {
  lessonId: number;
  lessonName: string;
  lessonSummary: string;
  vocabulary: {id: number; word: string; definition: string}[];
  objectives: {id: number; description: string}[];
  assessmentAnalysis: RailsAssessmentQuestionResult[];
  jsonVideos: {key: string; url: string; description: string}[];
  progressCounts: {
    levelsTotalCount: number;
    levelsAttemptedCount: number;
    validatedLevelsTotalCount: number;
    validatedLevelsCorrectCount: number;
    validatedLevelsIncorrectCount: number;
  };
  timeSpentSeconds: number;
  unitLabel: string | null;
}

export const LESSON_DEEP_DIVE_DATA: RailsLessonDeepDiveData = {
  lessonId: 129046,
  lessonName: 'Lesson 1: Talking to Machines',
  lessonSummary:
    '**How can I use AI effectively?**\n\nExplore how AI predicts responses and practice crafting better prompts to get more useful AI-generated answers.',
  vocabulary: [
    {
      id: 48010,
      word: 'abstraction',
      definition:
        'focusing on the important information and ignoring irrelevant details',
    },
    {
      id: 48013,
      word: 'artificial intelligence (AI)',
      definition:
        'a technology that mimics human intelligence, performing tasks such as understanding language, recognizing patterns, and making decisions',
    },
    {
      id: 48024,
      word: 'probability',
      definition: 'the likelihood that a specific outcome might occur',
    },
    {
      id: 48025,
      word: 'prompt',
      definition:
        "a question, instruction, scenario, or statement provided by the user to guide the AI's response",
    },
  ],
  objectives: [
    {
      id: 127566,
      description:
        'Experiment with different prompts to observe how AI’s responses change.',
    },
    {
      id: 127582,
      description:
        'Analyze patterns in AI-generated responses to explain how input prompts influence outputs.',
    },
    {
      id: 127585,
      description:
        'Refine AI-generated outputs by iterating on prompts and recognizing patterns in responses.',
    },
    {
      id: 127591,
      description:
        'Explain that AI models use probability and statistics to generate responses.',
    },
  ],
  assessmentAnalysis: [
    {
      level_id: 81329,
      script_level_id: 72975,
      attempts: 0,
      correct: false,
      question_text:
        'Think back to your exploration with the AI chatbot in Level 5. \r\n\r\n**How did your AI-generated output change as you made updates to your prompt?** ',
      student_response: 'No attempt yet',
      evaluation: null,
      aiReasoning: null,
    },
  ],
  jsonVideos: [
    {
      key: 'lesson-tutor-aif26-u1-l1-v1',
      url: 'http://localhost:3000/json_videos/lesson-tutor-aif26-u1-l1-v1/content',
      description: 'AIF 2026 Unit 1 Lesson 1 Video 1',
    },
    {
      key: 'lesson-tutor-aif26-u1-l1-v2',
      url: 'http://localhost:3000/json_videos/lesson-tutor-aif26-u1-l1-v2/content',
      description: 'AIF 2026 Unit 1 Lesson 1 Video 2',
    },
  ],
  progressCounts: {
    levelsTotalCount: 6,
    levelsAttemptedCount: 0,
    validatedLevelsTotalCount: 1,
    validatedLevelsCorrectCount: 0,
    validatedLevelsIncorrectCount: 0,
  },
  timeSpentSeconds: 0,
  unitLabel: 'Unit 1',
};

// GET /practice_problems, PracticeProblem#summarize.
export const PRACTICE_PROBLEMS = [
  {
    id: 1,
    key: 'tutor_test_practice_problem_lesson_1',
    problem_type: 'multiple_choice_single_select',
    active: true,
    problem_text:
      "What is the best way to improve the accuracy of an AI's response?",
    solution: [
      {
        option:
          'Ask the same question multiple times until you get the answer you want',
        correct: false,
      },
      {
        option: 'Keep the prompt as short as possible to avoid confusion',
        correct: false,
      },
      {
        option: 'Change the AI settings to \\"high accuracy mode\\"',
        correct: false,
      },
      {option: 'Provide a more detailed and specific prompt', correct: true},
    ],
    objectives: [
      {
        id: 108611,
        description:
          'Experiment with different prompts to observe how AI’s responses change.',
      },
    ],
    created_at: '2026-07-08 22:00:04 UTC',
    updated_at: '2026-07-08 22:00:04 UTC',
  },
  {
    id: 2,
    key: 'tutor_test_practice_problem_lesson_2',
    problem_type: 'multiple_choice_single_select',
    active: true,
    problem_text:
      'Predict the word that you think will probably come next in the following sentence: The dog barked at the...',
    solution: [
      {option: 'happiness', correct: false},
      {option: 'cat', correct: true},
      {option: 'write', correct: false},
      {option: 'his', correct: false},
    ],
    objectives: [
      {
        id: 108611,
        description:
          'Experiment with different prompts to observe how AI’s responses change.',
      },
    ],
    created_at: '2026-07-08 22:00:04 UTC',
    updated_at: '2026-07-08 22:00:04 UTC',
  },
];
