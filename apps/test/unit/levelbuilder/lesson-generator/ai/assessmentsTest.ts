import {
  renderMatchDsl,
  renderMultiDsl,
} from '@cdo/apps/levelbuilder/lesson-generator/ai/assessments';

describe('renderMultiDsl', () => {
  const answers = [
    {text: 'right answer', correct: true},
    {text: 'wrong answer', correct: false},
  ];

  it('renders name, question, and right/wrong lines in order', () => {
    const dsl = renderMultiDsl('lesson1-quiz', 'What is 2+2?', answers);
    const lines = dsl.split('\n');
    expect(lines[0]).toBe("name 'lesson1-quiz'");
    expect(dsl).toContain("question 'What is 2+2?'");
    expect(dsl.indexOf("right 'right answer'")).toBeLessThan(
      dsl.indexOf("wrong 'wrong answer'")
    );
    expect(dsl).toContain('allow_multiple_attempts true');
  });

  it('escapes single quotes and backslashes in DSL literals', () => {
    const dsl = renderMultiDsl("it's-a-quiz", "What's a \\ for?", [
      {text: "don't know", correct: true},
    ]);
    expect(dsl).toContain("name 'it\\'s-a-quiz'");
    expect(dsl).toContain("question 'What\\'s a \\\\ for?'");
    expect(dsl).toContain("right 'don\\'t know'");
  });

  it('picks a heredoc tag that does not collide with the body', () => {
    const dsl = renderMultiDsl('q', 'Body mentions MARKDOWN here', answers);
    expect(dsl).toContain('markdown <<MARKDOWN_1\n');
    expect(dsl).toContain('\nMARKDOWN_1');
  });
});

describe('renderMatchDsl', () => {
  const pairs = [
    {question: 'loop', answer: 'repeats code'},
    {question: 'variable', answer: 'stores a value'},
  ];

  it('renders alternating question/answer lines', () => {
    const dsl = renderMatchDsl('lesson1-match', 'Match the terms.', pairs);
    const lines = dsl.split('\n');
    const qIndex = lines.indexOf("question 'loop'");
    expect(lines[qIndex + 1]).toBe("answer 'repeats code'");
    expect(dsl).toContain("question 'variable'");
  });

  it('omits the markdown block when instructions are blank', () => {
    const dsl = renderMatchDsl('m', '   ', pairs);
    expect(dsl).not.toContain('markdown');
  });

  it('includes the markdown heredoc when instructions are present', () => {
    const dsl = renderMatchDsl('m', 'Drag each answer.', pairs);
    expect(dsl).toContain('markdown <<MARKDOWN\nDrag each answer.\nMARKDOWN');
  });
});
