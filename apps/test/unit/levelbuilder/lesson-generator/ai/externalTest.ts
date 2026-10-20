import {renderExternalDsl} from '@cdo/apps/levelbuilder/lesson-generator/ai/external';

describe('renderExternalDsl', () => {
  it('renders name, title, and the markdown heredoc', () => {
    const dsl = renderExternalDsl(
      'unit1-read',
      'Collecting Data',
      '### Sensors\n\nThey are everywhere.',
      ''
    );
    expect(dsl).toContain("name 'unit1-read'");
    expect(dsl).toContain("title 'Collecting Data'");
    expect(dsl).toContain(
      'markdown <<MARKDOWN\n### Sensors\n\nThey are everywhere.\nMARKDOWN'
    );
    expect(dsl).not.toContain('teacher_markdown');
  });

  it('adds teacher_markdown only when notes exist', () => {
    const dsl = renderExternalDsl('n', 't', 'body', 'Check answers first.');
    expect(dsl).toContain(
      'teacher_markdown <<MARKDOWN\nCheck answers first.\nMARKDOWN'
    );
  });

  it('escapes quotes in the title', () => {
    const dsl = renderExternalDsl('n', "Byte's World", 'body', '');
    expect(dsl).toContain("title 'Byte\\'s World'");
  });
});
