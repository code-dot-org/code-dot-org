import {
  Role,
  AITutorInteractionStatus as Status,
} from '@cdo/apps/aiTutor/types';

// Initial messages we set when the user selects a tutor type.
// General Chat
export const generalChatMessage = {
  id: 0,
  role: Role.ASSISTANT,
  status: Status.OK,
  chatMessageText: 'Type your question below, and I will try to help.',
};

// Compilation
export const runCode = {
  id: 0,
  role: Role.ASSISTANT,
  status: Status.OK,
  chatMessageText: 'Run your code first and see what happens.',
};

export const compilationSuccess = {
  id: 0,
  role: Role.ASSISTANT,
  status: Status.OK,
  chatMessageText: '🎉 Your code is compiling successfully. Great work!',
};

export const compilationError = {
  id: 0,
  role: Role.ASSISTANT,
  status: Status.OK,
  chatMessageText:
    'Ah! You do have an error. Submit your code, and I will try to help.',
};

// Validation
export const testCode = {
  id: 0,
  role: Role.ASSISTANT,
  status: Status.OK,
  chatMessageText: 'Test your code first and see what happens.',
};

export const validationSuccess = {
  id: 0,
  role: Role.ASSISTANT,
  status: Status.OK,
  chatMessageText: '🎉 Your tests are passing. Wahoo!',
};

export const compilationErrorFirst = {
  id: 0,
  role: Role.ASSISTANT,
  status: Status.OK,
  chatMessageText:
    'Uh oh! Your code has to compile successfully before we can work on passing tests.',
};

export const validationError = {
  id: 0,
  role: Role.ASSISTANT,
  status: Status.OK,
  chatMessageText:
    'Your tests are failing. Submit your code and tests, and I will try to help.',
};

export const genericCompilation = `"Why doesn't my code compile?"`;
export const genericValidation = `"Why are my tests failing?"`;
