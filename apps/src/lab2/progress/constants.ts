// Generic validation to indicate all tests passed.
// Used in labs that use levelbuilder-written unit tests for validation.
export const PASSED_ALL_TESTS_VALIDATION = {
  conditions: [
    {
      name: 'PASSED_ALL_TESTS',
      value: 'true',
    },
  ],
  message: '',
  next: true,
  key: 'passed_all_tests',
};
