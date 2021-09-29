import {expect} from '../../../util/reconfiguredChai';
import createP5Wrapper from '../../../util/gamelab/TestableP5Wrapper';
import CoreLibrary from '@cdo/apps/p5lab/spritelab/CoreLibrary';
import {commands} from '@cdo/apps/p5lab/spritelab/commands/validationCommands';
import {commands as worldCommands} from '@cdo/apps/p5lab/spritelab/commands/worldCommands';

describe('Validation Commands', () => {
  let coreLibrary;

  beforeEach(function() {
    const p5Wrapper = createP5Wrapper();
    coreLibrary = new CoreLibrary(p5Wrapper.p5);
  });

  it('getTitle', () => {
    expect(commands.getTitle.apply(coreLibrary)).to.deep.equal({
      title: undefined,
      subtitle: undefined
    });
    worldCommands.showTitleScreen.apply(coreLibrary, [
      'my title',
      'my subtitle'
    ]);
    expect(commands.getTitle.apply(coreLibrary)).to.deep.equal({
      title: 'my title',
      subtitle: 'my subtitle'
    });
    worldCommands.hideTitleScreen.apply(coreLibrary);
    expect(commands.getTitle.apply(coreLibrary)).to.deep.equal({
      title: undefined,
      subtitle: undefined
    });
  });

  it('getPrintLog', () => {
    expect(commands.getPrintLog.apply(coreLibrary)).to.deep.equal([]);
    worldCommands.printText.apply(coreLibrary, ['first']);
    expect(commands.getPrintLog.apply(coreLibrary)).to.deep.equal(['first']);
    worldCommands.printText.apply(coreLibrary, ['second']);
    expect(commands.getPrintLog.apply(coreLibrary)).to.deep.equal([
      'first',
      'second'
    ]);
    worldCommands.printText.apply(coreLibrary, ['third']);
    expect(commands.getPrintLog.apply(coreLibrary)).to.deep.equal([
      'first',
      'second',
      'third'
    ]);
  });

  it('getPromptVars', () => {
    expect(commands.getPromptVars.apply(coreLibrary)).to.deep.equal({});
    worldCommands.setPrompt.apply(coreLibrary, [
      'prompt text',
      'myVar1',
      () => {}
    ]);
    worldCommands.setPrompt.apply(coreLibrary, [
      'prompt text',
      'myVar2',
      () => {}
    ]);
    worldCommands.setPromptWithChoices.apply(coreLibrary, [
      'prompt text',
      'myVar3',
      'a',
      'b',
      'c',
      () => {}
    ]);
    worldCommands.setPromptWithChoices.apply(coreLibrary, [
      'prompt text',
      'myVar4',
      1,
      2,
      3,
      () => {}
    ]);
    expect(commands.getPromptVars.apply(coreLibrary)).to.deep.equal({
      myVar1: null,
      myVar2: null,
      myVar3: null,
      myVar4: null
    });
    coreLibrary.onPromptAnswer('myVar2', 'my answer');
    coreLibrary.onPromptAnswer('myVar3', 2);
  });
});
