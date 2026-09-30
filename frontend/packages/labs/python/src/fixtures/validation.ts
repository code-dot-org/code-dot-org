import {
  createLevelPropertyFixture,
  type LabFixture,
} from '@code-dot-org/core/api/mocks';

// A level validated by a levelbuilder-written unittest file. main.py starts
// wrong, so Validate fails until the student fixes `add`.
const SOURCE = {
  files: {
    '0': {
      id: '0',
      name: 'main.py',
      language: 'python',
      contents: 'def add(a, b):\n    return a - b\n',
      folderId: '0',
      active: true,
    },
  },
  folders: {},
  openFiles: ['0'],
};

const VALIDATION_FILE = {
  id: 'validation',
  name: 'validation.py',
  language: 'python',
  folderId: '0',
  type: 'validation' as const,
  contents: [
    'import unittest',
    'from main import add',
    '',
    'class TestAdd(unittest.TestCase):',
    '    def test_positive(self):',
    '        """add(2, 3) returns 5"""',
    '        self.assertEqual(add(2, 3), 5)',
    '',
    '    def test_zero(self):',
    '        """add(-1, 1) returns 0"""',
    '        self.assertEqual(add(-1, 1), 0)',
    '',
  ].join('\n'),
};

const validation: LabFixture = {
  sources: {source: SOURCE},
  levelProperties: {
    '1': createLevelPropertyFixture({
      id: 1,
      name: 'Python Lab validation',
      type: 'Pythonlab',
      appName: 'pythonlab',
      usesProjects: true,
      offerBrowserTts: false,
      showExemplarLink: false,
      exemplarSources: null,
      longInstructions:
        '## Fix `add`\n\n`add(a, b)` should return the sum of `a` and `b`. ' +
        'Press **Validate** to check your work.',
      validationFile: VALIDATION_FILE,
      // What the server derives for a level with a validation file.
      validations: [
        {
          conditions: [{name: 'PASSED_ALL_TESTS', value: 'true'}],
          message: '',
          next: true,
        },
      ],
    }),
  },
  theme: {},
};

export default validation;
