import {Progress} from '@cdo/apps/adaptive/progress/model';
import {
  GENERATION_TRACE_KEY,
  applyGeneratedFiles,
  freeResponseAnswers,
  editableFiles,
  generationTraceId,
} from '@cdo/apps/adaptive/project/projectGeneration';
import {Pathway} from '@cdo/apps/adaptive/types';
import {Channel, ProjectFileType, ProjectSources} from '@cdo/apps/lab2/types';

const pathway: Pathway = {
  formatVersion: 4,
  id: 'p',
  title: 'Build a website',
  objective: 'Make a site.',
  project: {templateLevel: 'tmpl', description: 'A site.'},
  skills: {},
  checkpoints: [
    {
      id: 'intro',
      title: 'Intro',
      description: 'Start.',
      steps: [
        {
          id: 'plan',
          title: 'Plan',
          kind: 'questions',
          questions: [
            {id: 1, type: 'freeResponse', text: 'What will you make?'},
            {
              id: 2,
              type: 'MultipleChoiceQuestion',
              questionName: 'q2',
              questionTitle: 'Pick one',
              choices: [
                {id: 'a', text: 'A'},
                {id: 'b', text: 'B'},
              ],
            },
            {id: 3, type: 'freeResponse', text: 'Who is it for?'},
          ],
        },
        {
          id: 'branch',
          title: 'Branch',
          kind: 'questions',
          showIf: {stepId: 'plan', questionId: 2, choiceId: 'b'},
          questions: [{id: 6, type: 'freeResponse', text: 'Why B?'}],
        },
      ],
    },
    {
      id: 'later',
      title: 'Later',
      description: 'More.',
      steps: [
        {
          id: 'more',
          title: 'More',
          kind: 'questions',
          questions: [{id: 4, type: 'freeResponse', text: 'Anything else?'}],
        },
      ],
    },
  ],
};

const sources: ProjectSources = {
  source: {
    folders: {},
    files: {
      '1': {
        id: '1',
        name: 'index.html',
        contents: '<h1>Hi</h1>',
        folderId: '0',
      },
      '2': {id: '2', name: 'style.css', contents: 'h1 {}', folderId: '0'},
      '3': {
        id: '3',
        name: 'logo.png',
        contents: '',
        folderId: '0',
        url: 'https://example.com/logo.png',
      },
      '4': {
        id: '4',
        name: 'check.js',
        contents: 'check()',
        folderId: '0',
        type: ProjectFileType.VALIDATION,
      },
      '5': {
        id: '5',
        name: 'helper.js',
        contents: 'help()',
        folderId: '0',
        type: ProjectFileType.SUPPORT,
      },
      '6': {
        id: '6',
        name: 'about.html',
        contents: '<p>About</p>',
        folderId: '0',
        type: ProjectFileType.LOCKED_STARTER,
      },
    },
  },
};

describe('freeResponseAnswers', () => {
  it('lists the latest text of each answered free response question, in pathway order', () => {
    const progress: Progress = {
      steps: {
        more: {timeSpent: 0, answers: {4: [{answerId: 'x', text: 'No'}]}},
        plan: {
          timeSpent: 0,
          answers: {
            1: [
              {answerId: 'x', text: 'A cat site'},
              {answerId: 'y', text: 'A dog site'},
            ],
            2: [{answerId: 'a'}],
            3: [{answerId: 'x', text: '   '}],
          },
        },
      },
    };
    expect(freeResponseAnswers(pathway, progress)).toEqual([
      {question: 'What will you make?', answer: 'A dog site'},
      {question: 'Anything else?', answer: 'No'},
    ]);
  });

  it('is empty with nothing answered', () => {
    expect(freeResponseAnswers(pathway, {steps: {}})).toEqual([]);
  });
  it('leaves out a branch the current answers hide', () => {
    const branchAnswer = {6: [{answerId: '', text: 'Because'}]};
    const shown: Progress = {
      steps: {
        plan: {timeSpent: 0, answers: {2: [{answerId: 'b'}]}},
        branch: {timeSpent: 0, answers: branchAnswer},
      },
    };
    expect(freeResponseAnswers(pathway, shown).map(a => a.answer)).toEqual([
      'Because',
    ]);
    const hidden: Progress = {
      steps: {
        plan: {timeSpent: 0, answers: {2: [{answerId: 'b'}, {answerId: 'a'}]}},
        branch: {timeSpent: 0, answers: branchAnswer},
      },
    };
    expect(freeResponseAnswers(pathway, hidden)).toEqual([]);
  });
});

describe('editableFiles', () => {
  it('lists the files the student edits, locked or not, and no asset or hidden file', () => {
    expect(editableFiles(sources).map(file => file.name)).toEqual([
      'index.html',
      'style.css',
      'about.html',
    ]);
  });

  it('is empty for a single-source project', () => {
    expect(editableFiles({source: 'print(1)'})).toEqual([]);
    expect(editableFiles(undefined)).toEqual([]);
  });
});

describe('applyGeneratedFiles', () => {
  it('replaces matching text files and keeps the rest', () => {
    const seeded = applyGeneratedFiles(sources, [
      {name: 'index.html', contents: '<h1>Dogs</h1>'},
      {name: 'check.js', contents: 'nope()'},
      {name: 'helper.js', contents: 'nope()'},
      {name: 'extra.html', contents: '<p>no</p>'},
    ]);
    expect(seeded).toEqual({
      source: {
        folders: {},
        files: {
          ...((sources.source as {files: unknown}).files as object),
          '1': {
            id: '1',
            name: 'index.html',
            contents: '<h1>Dogs</h1>',
            folderId: '0',
          },
        },
      },
    });
    expect(sources.source).toMatchObject({
      files: {'1': {contents: '<h1>Hi</h1>'}},
    });
  });

  it('is undefined when no file matched', () => {
    expect(
      applyGeneratedFiles(sources, [{name: 'extra.html', contents: ''}])
    ).toBeUndefined();
    expect(
      applyGeneratedFiles({source: 'print(1)'}, [
        {name: 'index.html', contents: ''},
      ])
    ).toBeUndefined();
  });
});

describe('generationTraceId', () => {
  it('reads the trace off the channel', () => {
    const channel = {
      labConfig: {adaptive: {[GENERATION_TRACE_KEY]: 'ab'.repeat(16)}},
    } as unknown as Channel;
    expect(generationTraceId(channel)).toBe('ab'.repeat(16));
    expect(generationTraceId({} as Channel)).toBeUndefined();
    expect(generationTraceId(undefined)).toBeUndefined();
  });
});
