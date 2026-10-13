import {ProjectFileType} from '@cdo/apps/lab2/types';
import {
  MAX_CODE_CHARACTERS,
  buildDescriptionPrompt,
  cleanDescription,
  getDescribableFiles,
  withTimeout,
} from '@cdo/apps/pythonlab/theaterDescription';

const file = (
  id: string,
  name: string,
  contents: string,
  type?: ProjectFileType
) => ({id, name, contents, folderId: '0', type});

describe('theaterDescription', () => {
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
  });

  describe('cleanDescription', () => {
    it('strips markdown a screen reader would read aloud', () => {
      expect(
        cleanDescription('## Scene\n- A **red** circle\n- `blue` text')
      ).toBe('Scene A red circle blue text');
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
});
