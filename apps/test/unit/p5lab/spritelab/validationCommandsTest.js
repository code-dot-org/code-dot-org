import {expect} from '../../../util/reconfiguredChai';
import {commands} from '@cdo/apps/p5lab/spritelab/commands/validationCommands';
import {commands as worldCommands} from '@cdo/apps/p5lab/spritelab/commands/worldCommands';
import * as coreLibrary from '@cdo/apps/p5lab/spritelab/coreLibrary';

describe('Validation Commands', () => {
  it('getTitle', () => {
    expect(commands.getTitle()).to.deep.equal({
      title: undefined,
      subtitle: undefined
    });
    worldCommands.showTitleScreen('my title', 'my subtitle');
    expect(commands.getTitle()).to.deep.equal({
      title: 'my title',
      subtitle: 'my subtitle'
    });
    worldCommands.hideTitleScreen();
    expect(commands.getTitle()).to.deep.equal({
      title: undefined,
      subtitle: undefined
    });
  });

  it('getPrintLog', () => {
    expect(commands.getPrintLog()).to.deep.equal([]);
    worldCommands.printText('first');
    expect(commands.getPrintLog()).to.deep.equal(['first']);
    worldCommands.printText('second');
    expect(commands.getPrintLog()).to.deep.equal(['first', 'second']);
    worldCommands.printText('third');
    expect(commands.getPrintLog()).to.deep.equal(['first', 'second', 'third']);
  });

  it('getPromptVars', () => {
    expect(commands.getPromptVars()).to.deep.equal({});
    worldCommands.setPrompt('prompt text', 'myVar1', () => {});
    worldCommands.setPrompt('prompt text', 'myVar2', () => {});
    worldCommands.setPromptWithChoices(
      'prompt text',
      'myVar3',
      ['a', 'b', 'c'],
      () => {}
    );
    worldCommands.setPromptWithChoices(
      'prompt text',
      'myVar4',
      [1, 2, 3],
      () => {}
    );
    expect(commands.getPromptVars()).to.deep.equal({
      myVar1: null,
      myVar2: null,
      myVar3: null,
      myVar4: null
    });
    coreLibrary.onPromptAnswer('myVar2', 'my answer');
    coreLibrary.onPromptAnswer('myVar3', 2);
  });
});
