import {LevelProperties} from '@cdo/apps/lab2/types';
import {
  formatPrecedingLevels,
  PriorEntry,
  priorOutputFromLevelProperties,
} from '@cdo/apps/levelbuilder/lesson-generator/helpers/precedingLevels';

describe('priorOutputFromLevelProperties', () => {
  const props = (p: object) => p as LevelProperties;

  it('returns undefined without properties', () => {
    expect(priorOutputFromLevelProperties(undefined, 'panels')).toBeUndefined();
  });

  it('keys codebridge output by lab type', () => {
    const startSources = {
      folders: {},
      files: {a: {id: 'a', name: 'main.py', contents: 'print(1)'}},
    };
    const web = priorOutputFromLevelProperties(
      props({startSources, longInstructions: 'x'}),
      'weblab2'
    );
    expect(web?.weblab2?.files).toEqual([
      {name: 'main.py', contents: 'print(1)'},
    ]);
    const py = priorOutputFromLevelProperties(
      props({startSources, longInstructions: 'x'}),
      'pythonlab'
    );
    expect(py?.pythonlab).toBeDefined();
    expect(py?.weblab2).toBeUndefined();
  });

  it('summarizes multi with its correct answer', () => {
    const out = priorOutputFromLevelProperties(
      props({
        markdown: 'What is 2+2?',
        answers: [
          {text: '4', correct: true},
          {text: '5', correct: false},
        ],
      }),
      'multi'
    );
    expect(out?.multi?.summary).toBe('Multi — Q: What is 2+2?; A: 4');
  });

  it('summarizes a free response question', () => {
    const out = priorOutputFromLevelProperties(
      props({longInstructions: 'Explain loops\nin your own words.'}),
      'freeResponse'
    );
    expect(out?.freeResponse?.summary).toBe(
      'Free response — Q: Explain loops in your own words.'
    );
  });

  it('survives hand-edited non-JSON ailab mode strings', () => {
    const out = priorOutputFromLevelProperties(
      props({
        longInstructions: 'x',
        mode: 'not json',
        dynamicInstructions: '{"selectDataset": "pick one"}',
      }),
      'ailab'
    );
    expect(out?.ailab?.summary).toContain('dataset=(unknown)');
    expect(out?.ailab?.summary).toContain('screens=selectDataset');
  });
});

describe('formatPrecedingLevels', () => {
  it('returns the empty string for no entries', () => {
    expect(formatPrecedingLevels([])).toBe('');
  });

  it('renders codebridge files and instructions', () => {
    const entries: PriorEntry[] = [
      {
        position: 1,
        name: 'l-build',
        labType: 'pythonlab',
        description: 'first build',
        output: {
          pythonlab: {
            startSources: {folders: {}, files: {}},
            longInstructions: 'TODOs:\n- add a print',
            files: [{name: 'main.py', contents: 'print(1)'}],
          },
        },
      },
    ];
    const text = formatPrecedingLevels(entries);
    expect(text).toContain('Level 1: l-build (pythonlab)');
    expect(text).toContain('    main.py:');
    expect(text).toContain('      print(1)');
    expect(text).toContain('    - add a print');
  });

  it('renders assessment entries as their one-line summary', () => {
    const text = formatPrecedingLevels([
      {
        position: 2,
        name: 'l-quiz',
        labType: 'multi',
        description: 'check',
        output: {
          multi: {
            dslText: '',
            summary: 'Multi — Q: q; A: a',
            longInstructions: '',
          },
        },
      },
    ]);
    expect(text).toContain('  Multi — Q: q; A: a');
  });
});
