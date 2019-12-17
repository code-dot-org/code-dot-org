import {assert} from '../../../../util/deprecatedChai';

describe('CommandHistory', function() {
  var CommandHistory = require('@cdo/apps/lib/tools/jsdebugger/CommandHistory');
  var history, inputText;

  beforeEach(function() {
    history = new CommandHistory();
    inputText = '';
  });

  it('recounts commands in reverse order when moving back through history', function() {
    history.push('one');
    history.push('two');
    history.push('three');
    inputText = history.goBack(inputText);
    assert.equal('three', inputText);
    inputText = history.goBack(inputText);
    assert.equal('two', inputText);
    inputText = history.goBack(inputText);
    assert.equal('one', inputText);
  });

  it('recounts commands in original order when moving forward through history', function() {
    history.push('one');
    history.push('two');
    history.push('three');
    inputText = history.goBack(inputText);
    assert.equal('three', inputText);
    inputText = history.goBack(inputText);
    assert.equal('two', inputText);
    inputText = history.goBack(inputText);
    assert.equal('one', inputText);
    inputText = history.goForward(inputText);
    assert.equal('two', inputText);
    inputText = history.goForward(inputText);
    assert.equal('three', inputText);
  });

  it('returns beginning of history when trying to move back past beginning of history', function() {
    history.push('one');
    history.push('two');
    inputText = history.goBack(inputText);
    assert.equal('two', inputText);
    inputText = history.goBack(inputText);
    assert.equal('one', inputText);
    inputText = history.goBack(inputText);
    assert.equal('one', inputText);
  });

  it('returns empty string when moving forward past beginning of history', function() {
    history.push('one');
    inputText = history.goBack(inputText);
    assert.equal('one', inputText);
    inputText = history.goForward(inputText);
    assert.equal('', inputText);
    inputText = history.goForward(inputText);
    assert.equal('', inputText);
  });

  it('stores a maximum of 64 commands', function() {
    var i;
    for (i = 0; i < 65; i++) {
      history.push(i.toString());
    }

    // First 64 commands walking backward show up
    for (i = 64; i >= 1; i--) {
      inputText = history.goBack(inputText);
      assert.equal(i.toString(), inputText);
    }

    // 65th command does not
    inputText = history.goBack(inputText);
    assert.equal('1', inputText);
  });
});
