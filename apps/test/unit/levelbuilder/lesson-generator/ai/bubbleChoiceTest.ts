import {renderBubbleChoiceDsl} from '@cdo/apps/levelbuilder/lesson-generator/ai/bubbleChoice';

describe('renderBubbleChoiceDsl', () => {
  it('renders the parent fields and one level line per sublevel', () => {
    const dsl = renderBubbleChoiceDsl(
      'lesson1-choose',
      'Pick a Project',
      'Choose one activity to try.',
      ['lesson1-choose-art', 'lesson1-choose-music']
    );
    const lines = dsl.split('\n');
    expect(lines[0]).toBe("name 'lesson1-choose'");
    expect(dsl).toContain("display_name 'Pick a Project'");
    expect(dsl).toContain(
      'description <<MARKDOWN\nChoose one activity to try.\nMARKDOWN'
    );
    const sublevelsIndex = lines.indexOf('sublevels');
    expect(lines[sublevelsIndex + 1]).toBe("level 'lesson1-choose-art'");
    expect(lines[sublevelsIndex + 2]).toBe("level 'lesson1-choose-music'");
    expect(dsl).toContain('\nuses_lab2\n');
  });

  it('escapes quotes in names and display names', () => {
    const dsl = renderBubbleChoiceDsl("it's-choice", "Byte's Picks", 'd', [
      'sub-1',
    ]);
    expect(dsl).toContain("name 'it\\'s-choice'");
    expect(dsl).toContain("display_name 'Byte\\'s Picks'");
  });
});
