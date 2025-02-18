describe('CommandHistory', function () {
  var CommandHistory = require('@cdo/apps/lib/tools/jsdebugger/CommandHistory');
  var history, inputText;

  beforeEach(function () {
    history = new CommandHistory();
    inputText = '';
  });

  it('recounts commands in reverse order when moving back through history', function () {
    history.push('one');
    history.push('two');
    history.push('three');
    inputText = history.goBack(inputText);
    expect('three').toEqual(inputText);
    inputText = history.goBack(inputText);
    expect('two').toEqual(inputText);
    inputText = history.goBack(inputText);
    expect('one').toEqual(inputText);
  });

  it('recounts commands in original order when moving forward through history', function () {
    history.push('one');
    history.push('two');
    history.push('three');
    inputText = history.goBack(inputText);
    expect('three').toEqual(inputText);
    inputText = history.goBack(inputText);
    expect('two').toEqual(inputText);
    inputText = history.goBack(inputText);
    expect('one').toEqual(inputText);
    inputText = history.goForward(inputText);
    expect('two').toEqual(inputText);
    inputText = history.goForward(inputText);
    expect('three').toEqual(inputText);
  });

  it('returns beginning of history when trying to move back past beginning of history', function () {
    history.push('one');
    history.push('two');
    inputText = history.goBack(inputText);
    expect('two').toEqual(inputText);
    inputText = history.goBack(inputText);
    expect('one').toEqual(inputText);
    inputText = history.goBack(inputText);
    expect('one').toEqual(inputText);
  });

  it('returns empty string when moving forward past beginning of history', function () {
    history.push('one');
    inputText = history.goBack(inputText);
    expect('one').toEqual(inputText);
    inputText = history.goForward(inputText);
    expect('').toEqual(inputText);
    inputText = history.goForward(inputText);
    expect('').toEqual(inputText);
  });

  it('stores a maximum of 64 commands', function () {
    var i;
    for (i = 0; i < 65; i++) {
      history.push(i.toString());
    }

    // First 64 commands walking backward show up
    for (i = 64; i >= 1; i--) {
      inputText = history.goBack(inputText);
      expect(i.toString()).toEqual(inputText);
    }

    // 65th command does not
    inputText = history.goBack(inputText);
    expect('1').toEqual(inputText);
  });
});
