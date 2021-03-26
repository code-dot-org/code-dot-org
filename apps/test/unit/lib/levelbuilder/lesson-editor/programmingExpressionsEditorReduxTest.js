import {assert} from 'chai';
import programmingExpressionEditor, {
  removeProgrammingExpression
} from '@cdo/apps/lib/levelbuilder/lesson-editor/programmingExpressionsEditorRedux';

const getInitialState = () => [
  {
    id: 1,
    key: 'programmingExpression-1',
    name: 'playSound',
    category: 'UI controls',
    programmingEnvironmentName: 'applab'
  },
  {
    id: 2,
    key: 'programmingExpression-2',
    name: 'stopSound',
    category: 'UI controls',
    programmingEnvironmentName: 'applab'
  }
];

describe('programmingExpressionsEditorRedux reducer tests', () => {
  let initialState;
  beforeEach(() => (initialState = getInitialState()));

  it('remove programmingExpression', () => {
    assert.deepEqual(initialState.map(r => r.key), [
      'programmingExpression-1',
      'programmingExpression-2'
    ]);
    const nextState = programmingExpressionEditor(
      initialState,
      removeProgrammingExpression(1)
    );
    assert.deepEqual(nextState.map(r => r.key), ['programmingExpression-2']);
  });
});
