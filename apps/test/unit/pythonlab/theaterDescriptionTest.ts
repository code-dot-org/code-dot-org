import {generateText} from '@cdo/apps/aiGateway';
import {ProjectFileType} from '@cdo/apps/lab2/types';
import {
  MAX_CODE_CHARACTERS,
  MAX_RUN_CHARACTERS,
  buildDescriptionPrompt,
  canRequestTheaterDescription,
  cleanDescription,
  getDescribableFiles,
  requestTheaterDescription,
  withTimeout,
} from '@cdo/apps/pythonlab/theaterDescription';

jest.mock('@cdo/apps/aiGateway', () => ({generateText: jest.fn()}));
jest.mock('@cdo/apps/aichat/api/client/helpers/modelHelpers', () => ({
  getModel: () => 'model',
}));
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getMetricsReporter: () => ({incrementCounter: jest.fn()}),
      getProjectManager: () => null,
    }),
  },
}));
const mockCurrentUser = {
  usOnlyAichatModelsDisabled: false,
  aiChatAccessLevel: 'enabled',
};
jest.mock('@cdo/apps/redux', () => ({
  getStore: () => ({
    getState: () => ({
      currentUser: mockCurrentUser,
      progress: {currentLevelId: '7', scriptId: null},
      lab: {
        levelProperties: {
          appName: 'pythonlab',
          longInstructions: 'Draw a sun.',
        },
      },
    }),
  }),
}));

const mockGenerateText = generateText as jest.Mock;

const file = (
  id: string,
  name: string,
  contents: string,
  type?: ProjectFileType
) => ({id, name, contents, folderId: '0', type});

describe('theaterDescription', () => {
  describe('canRequestTheaterDescription', () => {
    afterEach(() => {
      Object.assign(mockCurrentUser, {
        usOnlyAichatModelsDisabled: false,
        aiChatAccessLevel: 'enabled',
      });
    });

    it('allows a user with AI access in the US', () => {
      expect(canRequestTheaterDescription()).toBe(true);
    });

    it('refuses a user without full AI access', () => {
      mockCurrentUser.aiChatAccessLevel = 'essential_only';
      expect(canRequestTheaterDescription()).toBe(false);
    });

    it('refuses a user blocked from US-only models', () => {
      mockCurrentUser.usOnlyAichatModelsDisabled = true;
      expect(canRequestTheaterDescription()).toBe(false);
    });
  });

  describe('getDescribableFiles', () => {
    it('keeps student and support python, and drops validation and system files', () => {
      const source = {
        folders: {},
        files: {
          1: file('1', 'main.py', 'draw_ellipse(0, 0, 10, 10)'),
          2: file('2', 'helpers.py', 'x = 1', ProjectFileType.SUPPORT),
          3: file('3', 'validation.py', 'test', ProjectFileType.VALIDATION),
          4: file('4', 'maze.json', '{}', ProjectFileType.SYSTEM_SUPPORT),
          5: file('5', 'notes.txt', 'hello'),
        },
      };
      expect(getDescribableFiles(source).map(f => f.name)).toEqual([
        'main.py',
        'helpers.py',
      ]);
    });
  });

  describe('buildDescriptionPrompt', () => {
    it('includes the instructions and each file by name', () => {
      const prompt = buildDescriptionPrompt('Draw a sun.', [
        file('1', 'main.py', 'draw_ellipse(150, 150, 100, 100)'),
      ]);
      expect(prompt).toContain('<instructions>\nDraw a sun.\n</instructions>');
      expect(prompt).toContain(
        '<file name="main.py">\ndraw_ellipse(150, 150, 100, 100)\n</file>'
      );
    });

    it('notes missing instructions and truncates code past the budget', () => {
      const long = 'a'.repeat(MAX_CODE_CHARACTERS + 10);
      const prompt = buildDescriptionPrompt('  ', [
        file('1', 'main.py', long),
        file('2', 'more.py', 'b = 2'),
      ]);
      expect(prompt).toContain('<instructions>\n(none)\n</instructions>');
      expect(prompt).not.toContain('a'.repeat(MAX_CODE_CHARACTERS + 1));
      expect(prompt).not.toContain('b = 2');
      expect(prompt).toContain('</code>');
    });

    it('adds what the run drew, truncated past its budget', () => {
      const prompt = buildDescriptionPrompt(
        'Draw a sun.',
        [file('1', 'main.py', 'play()')],
        {
          summary: 'A yellow circle.',
          transcript: 'x'.repeat(MAX_RUN_CHARACTERS),
        }
      );
      expect(prompt).toContain('<run>\nA yellow circle.\nxxx');
      expect(prompt).not.toContain('x'.repeat(MAX_RUN_CHARACTERS));
      expect(prompt).toContain('</run>');
    });
  });

  describe('cleanDescription', () => {
    it('strips markdown a screen reader would read aloud', () => {
      expect(
        cleanDescription('## Scene\n- A **red** circle\n- `blue` text')
      ).toBe('Scene A red circle blue text');
    });

    it('keeps punctuation that is part of the stage text', () => {
      expect(
        cleanDescription('The text "C# #1 hello_world 2 * 3 * 4" at the top.')
      ).toBe('The text "C# #1 hello_world 2 * 3 * 4" at the top.');
    });
  });

  describe('withTimeout', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('resolves with the value when it arrives in time', async () => {
      await expect(withTimeout(Promise.resolve('ok'), 1000)).resolves.toBe(
        'ok'
      );
    });

    it('rejects once the deadline passes', async () => {
      const pending = withTimeout(new Promise<string>(() => {}), 1000);
      jest.advanceTimersByTime(1000);
      await expect(pending).rejects.toThrow('timed out');
    });
  });

  describe('requestTheaterDescription', () => {
    const source = (code: string) => ({
      folders: {},
      files: {1: file('1', 'main.py', code)},
    });

    it('asks the model once per distinct program', async () => {
      mockGenerateText.mockResolvedValue({text: '**A sun.**'});

      await expect(requestTheaterDescription(source('a'))).resolves.toBe(
        'A sun.'
      );
      await expect(requestTheaterDescription(source('a'))).resolves.toBe(
        'A sun.'
      );
      await requestTheaterDescription(source('b'));

      expect(mockGenerateText).toHaveBeenCalledTimes(2);
    });

    it('asks again when the same program draws something different', async () => {
      mockGenerateText.mockResolvedValue({text: 'A die showing 3.'});

      await requestTheaterDescription(source('d'), {summary: 'Shows 3.'});
      await requestTheaterDescription(source('d'), {summary: 'Shows 5.'});

      expect(mockGenerateText).toHaveBeenCalledTimes(2);
    });

    it('does not cache a failure', async () => {
      mockGenerateText.mockRejectedValueOnce(new Error('down'));
      await expect(requestTheaterDescription(source('c'))).rejects.toThrow(
        'down'
      );
      mockGenerateText.mockResolvedValueOnce({text: 'A moon.'});
      await expect(requestTheaterDescription(source('c'))).resolves.toBe(
        'A moon.'
      );
    });
  });
});
