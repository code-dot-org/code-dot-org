import {assert} from 'chai';
import standardsEditor, {
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
    shortcode: 'shortcode-2',
    description: 'Translate between different bit representations of numbers.'
  }
];

const getInitialState = () => _.cloneDeep(fakeStandards);

describe('standardsEditorRedux reducer', () => {
  let initialState;
  beforeEach(() => (initialState = getInitialState()));

  it('removes standard', () => {
    const nextState = standardsEditor(
      initialState,
      removeStandard('framework-1', 'shortcode-1')
    );
    assert.deepEqual(nextState.map(s => s.shortcode), ['shortcode-2']);
  });
});
