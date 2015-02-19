var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var assertThrows = testUtils.assertThrows;

var utils = testUtils.requireWithGlobalsCheckBuildFolder('utils');
var commands = testUtils.requireWithGlobalsCheckBuildFolder('commands');
var Command = commands.Command;
var CommandSequence = commands.CommandSequence;

describe("Command", function () {
  var command;

  beforeEach(function () {
    command = new Command();
  });

  it ("begins neither started nor finished", function () {
    assert(!command.isStarted(), "Command should not be started");
    assert(!command.isFinished(), "Command should not be finished");
    assert(!command.succeeded(), "Command should not be successful");
    assert(!command.failed(), "Command should not be a failure");
  });

  it ("After begin() is started but not finished", function () {
    command.begin();
    assert(command.isStarted(), "Command should be started");
    assert(!command.isFinished(), "Command should not be finished");
    assert(!command.succeeded(), "Command should not be successful");
    assert(!command.failed(), "Command should not be a failure");
  });

  it ("After succeed() is started and finished but not a failure", function () {
    command.begin();
    command.succeed();
    assert(command.isStarted(), "Command should be started");
    assert(command.isFinished(), "Command should be finished");
    assert(command.succeeded(), "Command should be successful");
    assert(!command.failed(), "Command should not be a failure");
  });

  it ("After fail() is started and finished but not successful", function () {
    command.begin();
    command.fail();
    assert(command.isStarted(), "Command should be started");
    assert(command.isFinished(), "Command should be finished");
    assert(!command.succeeded(), "Command should not be successful");
    assert(command.failed(), "Command should be a failure");
  });

  it ("Cannot succeed before begin()", function () {
    assert(!command.isStarted());
    assertThrows(Error, command.succeed.bind(command));
  });

  it ("Cannot fail before begin()", function () {
    assert(!command.isStarted());
    assertThrows(Error, command.fail.bind(command));
  });

  it ("Calls onBegin_ when starting", function () {
    var called = false;
    command.onBegin_ = function () {
      called = true;
    };
    command.begin();
    assert(called);
  });

  it ("Calls onEnd_ when succeeding", function () {
    var called = false;
    command.onEnd_ = function () {
      called = true;
    };
    command.begin();
    command.succeed();
    assert(called);
  });

  it ("Calls onEnd_ when failing", function () {
    var called = false;
    command.onEnd_ = function () {
      called = true;
    };
    command.begin();
    command.fail();
    assert(called);
  });
});

describe("CommandSequence", function () {
  var sequence, sequenceLog;

  /**
   * Simple command that writes a key to the sequenceLog and succeeds
   * immediately.
   * @param {string} key
   * @constructor
   */
  var LogCommand = function (key) {
    Command.call(this);
    this.key_ = key;
  };
  LogCommand.inherits(Command);
  LogCommand.prototype.onBegin_ = function () {
    sequenceLog += this.key_;
    this.succeed();
  };

  /**
   * Command that writes a key to the sequenceLog and succeeds when
   * the "performAction" method is called manually.
   * @param key
   * @constructor
   */
  var ManualLogCommand = function (key) {
    Command.call(this);
    this.key_ = key;
  };
  ManualLogCommand.inherits(Command);
  ManualLogCommand.prototype.onBegin_ = function () {
    sequenceLog += this.key_;
  };

  /**
   * Command that fails as soon as it begins
   * @constructor
   */
  var FailCommand = function () {
    Command.call(this);
  };
  FailCommand.inherits(Command);
  FailCommand.prototype.onBegin_ = function () {
    this.fail();
  };

  beforeEach(function () {
    sequenceLog = '';
    sequence = new CommandSequence([]);
  });

  it ("is a Command", function () {
    assert(sequence instanceof Command, "CommandSequence is a Command");
  });

  it ("succeeds immediately on begin when command list is empty", function () {
    assert(!sequence.isStarted());
    assert(!sequence.isFinished());
    sequence.begin();
    assert(sequence.isStarted());
    assert(sequence.isFinished());
    assert(sequence.succeeded());
  });

  it ("runs commands in order, on tick, after started", function () {
    sequence = new CommandSequence([
        new LogCommand('A'),
        new LogCommand('B'),
        new LogCommand('C')
    ]);
    assertEqual(sequence.commandList_.length, 3);
    assertEqual(sequenceLog, '');

    sequence.tick();
    assert(!sequence.isStarted());
    assertEqual(sequenceLog, '');

    sequence.begin();
    assert(sequence.isStarted());
    assertEqual(sequenceLog, '');

    sequence.tick();
    assertEqual(sequenceLog, 'ABC');
    assert(sequence.isFinished());
  });

  it ("Succeeds if all of its commands succeed", function () {
    sequence = new CommandSequence([
        new LogCommand('A'),
        new LogCommand('B'),
        new LogCommand('C')
    ]);

    sequence.begin();
    sequence.tick();
    assertEqual(sequenceLog, 'ABC');
    assert(sequence.succeeded());
  });

  it ("Fails and stops sequence if any command fails", function () {
    sequence = new CommandSequence([
        new LogCommand('A'),
        new LogCommand('B'),
        new FailCommand(),
        new LogCommand('C')
    ]);

    sequence.begin();
    sequence.tick();
    assertEqual(sequenceLog, 'AB');
    assert(sequence.failed(), 'The sequence should fail');
  });

  it ("Succeeds only on tick after its last command succeeds", function () {
    var commandC = new ManualLogCommand('C');
    sequence = new CommandSequence([
        new LogCommand('A'),
        new LogCommand('B'),
        commandC
    ]);

    sequence.begin();
    sequence.tick();
    assertEqual(sequenceLog, 'ABC');
    assert(!commandC.isFinished());
    assert(!sequence.isFinished());

    commandC.succeed();
    assert(commandC.isFinished());
    assert(!sequence.isFinished());

    sequence.tick();
    assert(sequence.isFinished());
    assert(sequence.succeeded());
  });

  it ("calls each command on tick after the last one is finished", function () {
    var i;
    var commandA = new ManualLogCommand('A');
    var commandB = new ManualLogCommand('B');
    var commandC = new ManualLogCommand('C');

    sequence = new CommandSequence([
        commandA, commandB, commandC
    ]);

    sequence.begin();
    for (i = 0; i < 5; i++){
      sequence.tick();
    }
    assertEqual(sequenceLog, 'A');
    assert(commandA.isStarted());
    assert(!commandB.isStarted(), "Command B hasn't started yet.");
    assert(!commandC.isStarted(), "Command C hasn't started yet.");

    commandA.succeed();
    assert(commandA.isFinished());
    assert(!commandB.isStarted());

    sequence.tick();
    assertEqual(sequenceLog, 'AB');
    assert(commandA.isFinished());
    assert(commandB.isStarted());
    assert(!commandC.isStarted(), "Command C hasn't started yet.");

    commandB.succeed();
    assert(commandB.isFinished());
    assert(!commandC.isStarted());

    sequence.tick();
    assertEqual(sequenceLog, 'ABC');
    assert(commandA.isFinished());
    assert(commandB.isStarted());
    assert(commandC.isStarted());
  });

  it ("can be nested, but requires multiple ticks to complete", function () {
    sequence = new CommandSequence([
        new CommandSequence([
            new LogCommand('A'),
            new LogCommand('B')
        ]),
        new LogCommand('C'),
        new CommandSequence([
            new LogCommand('D'),
            new CommandSequence([
                new LogCommand('E'),
                new LogCommand('F')
            ])
        ])
    ]);

    sequence.begin();
    sequence.tick();
    assertEqual(sequenceLog, '');

    sequence.tick();
    assertEqual(sequenceLog, 'ABC');

    sequence.tick();
    assertEqual(sequenceLog, 'ABCD');

    sequence.tick();
    assertEqual(sequenceLog, 'ABCDEF');
  });

});
