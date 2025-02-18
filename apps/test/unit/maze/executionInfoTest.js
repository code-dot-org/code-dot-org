import ExecutionInfo from '@cdo/apps/maze/executionInfo';

describe('ExecutionInfo tests', function () {
  it('single action queue/dequeue', function () {
    var executionInfo = new ExecutionInfo();
    executionInfo.queueAction('command1', 1);
    executionInfo.queueAction('command2', 2);

    expect(executionInfo.steps_.length).toBe(2);

    var actions = executionInfo.getActions(true);
    expect(actions.length).toBe(1);
    var action = actions[0];
    expect(action.command).toBe('command1');
    expect(action.blockId).toBe(1);

    expect(executionInfo.steps_.length).toBe(1);

    actions = executionInfo.getActions();
    expect(actions.length).toBe(1);
    action = actions[0];
    expect(action.command).toBe('command2');
    expect(action.blockId).toBe(2);
  });

  it('multiple action steps: pull off one at a time', function () {
    var executionInfo = new ExecutionInfo();

    executionInfo.collectActions();
    expect(executionInfo.collection_.length).toBe(0);
    executionInfo.queueAction('step1Command1', 1);
    executionInfo.queueAction('step1Command2', 2);
    executionInfo.stopCollecting();
    expect(executionInfo.collection_).toBeNull();

    executionInfo.collectActions();
    expect(executionInfo.collection_.length).toBe(0);
    executionInfo.queueAction('step2Command1', 1);
    executionInfo.queueAction('step2Command2', 2);
    executionInfo.stopCollecting();
    expect(executionInfo.collection_).toBeNull();

    expect(executionInfo.steps_.length).toBe(2);

    var actions = executionInfo.getActions(true);
    expect(actions.length).toBe(2);
    expect(actions[0].command).toBe('step1Command1');
    expect(actions[1].command).toBe('step1Command2');

    actions = executionInfo.getActions(true);
    expect(actions.length).toBe(2);
    expect(actions[0].command).toBe('step2Command1');
    expect(actions[1].command).toBe('step2Command2');
  });

  it('multiple action steps: pull off all at once', function () {
    var executionInfo = new ExecutionInfo();

    executionInfo.collectActions();
    expect(executionInfo.collection_.length).toBe(0);
    executionInfo.queueAction('step1Command1', 1);
    executionInfo.queueAction('step1Command2', 2);
    executionInfo.stopCollecting();
    expect(executionInfo.collection_).toBeNull();

    executionInfo.collectActions();
    expect(executionInfo.collection_.length).toBe(0);
    executionInfo.queueAction('step2Command1', 1);
    executionInfo.queueAction('step2Command2', 2);
    executionInfo.stopCollecting();
    expect(executionInfo.collection_).toBeNull();

    expect(executionInfo.steps_.length).toBe(2);

    var actions = executionInfo.getActions(false);
    expect(actions.length).toBe(4);
    expect(actions[0].command).toBe('step1Command1');
    expect(actions[1].command).toBe('step1Command2');
    expect(actions[2].command).toBe('step2Command1');
    expect(actions[3].command).toBe('step2Command2');
  });

  it('termination', function () {
    var executionInfo = new ExecutionInfo();

    executionInfo.queueAction('command1', 1);
    executionInfo.queueAction('command2', 2);
    executionInfo.terminateWithValue(Infinity);
    expect(executionInfo.isTerminated()).toBe(true);
    expect(executionInfo.terminationValue()).toBe(Infinity);
  });

  it('last step with finish action', function () {
    var executionInfo = new ExecutionInfo();

    executionInfo.queueAction('command1', 1);
    executionInfo.queueAction('command2', 2);
    executionInfo.queueAction('finish', 3);

    var actions = executionInfo.getActions(true);
    expect(actions.length).toBe(1);
    actions = executionInfo.getActions(true);
    expect(actions.length).toBe(2);
    expect(actions[1].command).toBe('finish');
  });

  it('last step without finish action', function () {
    var executionInfo = new ExecutionInfo();

    executionInfo.queueAction('command1', 1);
    executionInfo.queueAction('command2', 2);

    var actions = executionInfo.getActions(true);
    expect(actions.length).toBe(1);
    actions = executionInfo.getActions(true);
    expect(actions.length).toBe(1);
  });
});
