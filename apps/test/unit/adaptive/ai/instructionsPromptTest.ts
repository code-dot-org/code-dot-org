import {hashString} from '@cdo/apps/adaptive/ai/hashString';
import {
  buildInstructionsPrompt,
  generatedInstructionsSchema,
} from '@cdo/apps/adaptive/ai/instructionsPrompt';
import {summarizeProjectFiles} from '@cdo/apps/adaptive/project/summarizeProjectFiles';
import {Checkpoint, LevelStep, Pathway} from '@cdo/apps/adaptive/types';
import {ProjectFileType} from '@cdo/apps/lab2/types';

const step: LevelStep = {
  id: 'build',
  title: 'Build the header',
  kind: 'level',
  level: 'project-level',
  project: true,
  instructionsPrompt: 'Get the site name into the header.',
};
const checkpoint: Checkpoint = {
  id: 'basics',
  title: 'Basics',
  description: 'First steps.',
  steps: [step],
};
const pathway: Pathway = {
  formatVersion: 4,
  id: 'p',
  title: 'Build a website',
  objective: 'Make a site.',
  project: {templateLevel: 'tmpl', description: 'A site.'},
  skills: {},
  checkpoints: [checkpoint],
};

describe('buildInstructionsPrompt', () => {
  it('includes the step brief, the project and the authored fallback', () => {
    const prompt = buildInstructionsPrompt({
      pathway,
      checkpoint,
      step,
      project: {
        name: 'Cat Corner',
        description: 'All about cats.',
        sourceCode: 'filename: index.html\n```\n<h1>Hi</h1>\n```',
      },
      fallback: 'Put your name in the header.',
    });

    expect(prompt).toContain('Get the site name into the header.');
    expect(prompt).toContain('"Cat Corner"');
    expect(prompt).toContain('All about cats.');
    expect(prompt).toContain('<h1>Hi</h1>');
    expect(prompt).toContain('Put your name in the header.');
    expect(prompt).toContain('TEMPLATE.');
    expect(prompt).toContain('```\nPut your name in the header.\n```');
    expect(prompt).toContain('40 words at most');
    expect(prompt).toContain('FORMAT RULES');
    expect(prompt).toContain('labeled contrast pair');
    expect(prompt).not.toMatch(/Web Lab|HTML|CSS|code/);
  });

  it("describes the lab from the project level's app, when known", () => {
    const webLab: Pathway = {
      ...pathway,
      project: {
        ...pathway.project,
        levelProperties: {id: 1, name: 'tmpl', appName: 'weblab2'},
      },
    };
    const prompt = buildInstructionsPrompt({
      pathway: webLab,
      checkpoint,
      step,
      project: {sourceCode: ''},
    });

    expect(prompt).toContain(
      'How the student works in this lab:\nStudents build the site in Web Lab 2'
    );
    expect(
      buildInstructionsPrompt({
        pathway,
        checkpoint,
        step,
        project: {sourceCode: ''},
      })
    ).not.toContain('How the student works in this lab');
  });

  it('says so when the project is unnamed and empty', () => {
    const prompt = buildInstructionsPrompt({
      pathway,
      checkpoint,
      step,
      project: {sourceCode: ''},
    });

    expect(prompt).toContain('untitled so far');
    expect(prompt).toContain('no files yet');
    expect(prompt).not.toContain('TEMPLATE.');
  });
});

describe('generatedInstructionsSchema', () => {
  it('requires non-empty instructions', () => {
    expect(
      generatedInstructionsSchema.safeParse({instructions: ''}).success
    ).toBe(false);
    expect(
      generatedInstructionsSchema.safeParse({instructions: 'x'}).success
    ).toBe(true);
  });
});

describe('summarizeProjectFiles', () => {
  it('lists readable files by path, images by path alone, and skips validation files', () => {
    const summary = summarizeProjectFiles({
      source: {
        folders: {f1: {id: 'f1', name: 'css', parentId: '0'}},
        files: {
          a: {
            id: 'a',
            name: 'index.html',
            contents: '<p>hi</p>',
            folderId: '0',
          },
          b: {id: 'b', name: 'style.css', contents: 'p{}', folderId: 'f1'},
          c: {
            id: 'c',
            name: 'check.js',
            contents: 'x',
            folderId: '0',
            type: ProjectFileType.VALIDATION,
          },
          d: {
            id: 'd',
            name: 'cat.png',
            contents: '',
            folderId: '0',
            url: 'http://img',
          },
        },
      },
    });

    expect(summary).toContain('filename: index.html\n```\n<p>hi</p>\n```');
    expect(summary).toContain('filename: /css/style.css\n```\np{}\n```');
    expect(summary).not.toContain('check.js');
    expect(summary).toContain('image: cat.png');
  });

  it('is empty with no sources', () => {
    expect(summarizeProjectFiles(undefined)).toBe('');
  });
});

describe('hashString', () => {
  it('is stable and distinguishes inputs', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
    expect(hashString('abc')).not.toBe(hashString('abd'));
    expect(hashString('')).toMatch(/^[0-9a-f]{8}$/);
  });
});
