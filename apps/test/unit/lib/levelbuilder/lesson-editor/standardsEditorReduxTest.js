import {assert} from 'chai';
import createStandardsEditor, {
  addStandard,
  removeStandard
} from '@cdo/apps/lib/levelbuilder/lesson-editor/standardsEditorRedux';
import _ from 'lodash';

const fakeStandards = [
  {
    frameworkShortcode: 'framework-1',
    frameworkName: 'Framework One',
    categoryShortcode: 'AP',
    categoryDescription: 'Algorithms & Programming',
    shortcode: 'shortcode-1',
    description: 'Create programs that use variables to store and modify data.'
  },
  {
    frameworkShortcode: 'framework-1',
    frameworkName: 'Framework One',
    categoryShortcode: 'DA',
    categoryDescription: 'Data & Analysis',
    shortcode: 'shortcode-3',
    description: 'Translate between different bit representations of numbers.'
  }
];

const getInitialState = () => _.cloneDeep(fakeStandards);

describe('standardsEditorRedux reducer', () => {
  let initialState, standardsEditor, opportunityStandardsEditor, newStandard;
  beforeEach(() => {
    standardsEditor = createStandardsEditor('standard');
    opportunityStandardsEditor = createStandardsEditor('opportunityStandard');
    newStandard = {
      frameworkShortcode: 'framework-1',
      frameworkName: 'Framework One',
      categoryShortcode: 'CS',
      categoryDescription: 'Computing Systems',
      shortcode: 'shortcode-4',
      description: 'fake description'
    };

    initialState = getInitialState();
  });

  it('adds standard', () => {
    const nextState = standardsEditor(
      initialState,
      addStandard('standard', newStandard)
    );
    assert.deepEqual(nextState.map(s => s.shortcode), [
      'shortcode-1',
      'shortcode-3',
      'shortcode-4'
    ]);
  });

  it('sorts standards by framework', () => {
    newStandard.frameworkName = 'Framework A';
    const nextState = standardsEditor(
      initialState,
      addStandard('standard', newStandard)
    );
    assert.deepEqual(nextState.map(s => s.shortcode), [
      'shortcode-4',
      'shortcode-1',
      'shortcode-3'
    ]);
  });

  it('sorts standards within framework by shortcode', () => {
    newStandard.shortcode = 'shortcode-2';
    const nextState = standardsEditor(
      initialState,
      addStandard('standard', newStandard)
    );
    assert.deepEqual(nextState.map(s => s.shortcode), [
      'shortcode-1',
      'shortcode-2',
      'shortcode-3'
    ]);
  });

  it('removes standard', () => {
    const nextState = standardsEditor(
      initialState,
      removeStandard('standard', {
        frameworkShortcode: 'framework-1',
        shortcode: 'shortcode-1'
      })
    );
    assert.deepEqual(nextState.map(s => s.shortcode), ['shortcode-3']);
  });

  it('adds opportunity standard without adding regular standard', () => {
    let nextState = opportunityStandardsEditor(
      initialState,
      addStandard('opportunityStandard', newStandard)
    );
    assert.deepEqual(nextState.map(s => s.shortcode), [
      'shortcode-1',
      'shortcode-3',
      'shortcode-4'
    ]);

    nextState = standardsEditor(
      initialState,
      addStandard('opportunityStandard', newStandard)
    );
    assert.deepEqual(nextState.map(s => s.shortcode), [
      'shortcode-1',
      'shortcode-3'
    ]);
  });
});
