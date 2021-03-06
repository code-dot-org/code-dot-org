import {assert} from 'chai';
import programmingExpressionEditor, {
  addProgrammingExpression,
  removeProgrammingExpression
} from '@cdo/apps/lib/levelbuilder/lesson-editor/programmingExpressionsEditorRedux';

const getInitialState = () => [
  {
    id: 1,
    key: 'programmingExpression-1',
    name: 'playSound',
    programmingEnvironmentName: 'applab'
  },
  {
    id: 2,
    key: 'programmingExpression-2',
    name: 'stopSound',
    programmingEnvironmentName: 'applab'
  }
];

describe('programmingExpressionsEditorRedux reducer tests', () => {
  let initialState;
  beforeEach(() => (initialState = getInitialState()));

  it('add programmingExpression', () => {
    const nextState = programmingExpressionEditor(
      initialState,
      addProgrammingExpression({
        id: 1,
        key: 'programmingExpression-3',
        name: 'repeatSound',
        programmingEnvironmentName: 'applab'
      })
    );
    assert.deepEqual(nextState.map(r => r.key), [
      'programmingExpression-1',
      'programmingExpression-2',
      'programmingExpression-3'
    ]);
  });

  it('remove programmingExpression', () => {
    const nextState = programmingExpressionEditor(
      initialState,
      removeProgrammingExpression('programmingExpression-1')
    );
    assert.deepEqual(nextState.map(r => r.key), ['programmingExpression-2']);
  });
});
