// The buttons above the composer.
//
// Ported from `apps/src/aiTutor/suggestedPrompts.ts`, labels and wording
// unchanged. They are not shortcuts so much as a statement of what the tutor is
// FOR: a student who does not know what to ask a tutor is the ordinary case,
// and three buttons answer that better than a placeholder does.
//
// Three sets, because which ones make sense depends on where the student is. A
// level has instructions to give a hint about; a project the student started
// themselves has nothing to hint at, and brainstorming is the useful offer.
// `defaultPrompts` are the ones that make sense either way, and the legacy call
// site appends them to whichever set applies (`AiTutorContainer`).

export interface SuggestedPrompt {
  id: string;
  /** What the button says. */
  label: string;
  /** What is sent when it is pressed. */
  value: string;
  /** A FontAwesome v6 icon name, as the design system's icon takes. */
  icon?: string;
  /** Passed through to the host's analytics, if it has any (specs/PLAN.md §12). */
  analyticsProperties?: Record<string, string>;
}

export const defaultPrompts: SuggestedPrompt[] = [
  {
    id: 'documentation',
    icon: 'book',
    label: 'Show documentation',
    value: 'Can you give me some documentation?',
    analyticsProperties: {cannedPrompt: 'documentation'},
  },
];

/** For a student working through a level, which has something to hint at. */
export const levelPrompts: SuggestedPrompt[] = [
  {
    id: 'example',
    icon: 'code',
    label: 'Give an example',
    value: 'Can you give me an example?',
    analyticsProperties: {cannedPrompt: 'example'},
  },
  {
    id: 'hint',
    icon: 'lightbulb',
    label: 'Give a hint',
    value: 'Can you give me a hint?',
    analyticsProperties: {cannedPrompt: 'hint'},
  },
];

/** For a project the student started themselves, where there is no task. */
export const standaloneProjectPrompts: SuggestedPrompt[] = [
  {
    id: 'brainstorm',
    icon: 'brain',
    label: 'Help me brainstorm',
    value: 'Can you help me brainstorm?',
    analyticsProperties: {cannedPrompt: 'brainstorm'},
  },
  {
    id: 'debug',
    icon: 'bug',
    label: 'Help me debug',
    value: 'Can you help me debug?',
    analyticsProperties: {cannedPrompt: 'debug'},
  },
  {
    id: 'projects',
    icon: 'star',
    label: 'Show me example projects',
    value: 'Can you show me example projects?',
    analyticsProperties: {cannedPrompt: 'projects'},
  },
];

/**
 * The set for a place, as `AiTutorContainer` assembles it.
 *
 * The place-specific ones first and the always-useful ones after, which is the
 * legacy order and the readable one: the buttons that answer "what do I do
 * here" come before the one that answers "what is this".
 */
export const promptsFor = (place: 'level' | 'project'): SuggestedPrompt[] => [
  ...(place === 'level' ? levelPrompts : standaloneProjectPrompts),
  ...defaultPrompts,
];
