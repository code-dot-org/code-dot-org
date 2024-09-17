import programmingExpressionEditor, {
  addProgrammingExpression,
  removeProgrammingExpression,
} from '@cdo/apps/levelbuilder/lesson-editor/programmingExpressionsEditorRedux'; // eslint-disable-line no-restricted-imports

const getInitialState = () => [
  {
    id: 1,
    key: 'programmingExpression-1',
    name: 'playSound',
    category: 'UI controls',
    programmingEnvironmentName: 'applab',
  },
  {
    id: 2,
    key: 'programmingExpression-2',
    name: 'stopSound',
    category: 'UI controls',
    programmingEnvironmentName: 'applab',
  },
];

describe('programmingExpressionsEditorRedux reducer tests', () => {
  let initialState;
  beforeEach(() => (initialState = getInitialState()));

  it('add programmingExpression', () => {
    expect(initialState.map(r => r.key)).toEqual([
      'programmingExpression-1',
      'programmingExpression-2',
    ]);

    const nextState = programmingExpressionEditor(
      initialState,
      addProgrammingExpression({
        id: 1,
        key: 'programmingExpression-3',
        name: 'repeatSound',
        category: 'UI controls',
        programmingEnvironmentName: 'applab',
      })
    );
    expect(nextState.map(r => r.key)).toEqual([
      'programmingExpression-1',
      'programmingExpression-2',
      'programmingExpression-3',
    ]);
  });

  it('remove programmingExpression', () => {
    expect(initialState.map(r => r.key)).toEqual([
      'programmingExpression-1',
      'programmingExpression-2',
    ]);
    const nextState = programmingExpressionEditor(
      initialState,
      removeProgrammingExpression(1)
    );
    expect(nextState.map(r => r.key)).toEqual(['programmingExpression-2']);
  });
});
