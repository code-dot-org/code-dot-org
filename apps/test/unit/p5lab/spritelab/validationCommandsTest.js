import {expect} from '../../../util/reconfiguredChai';
import createP5Wrapper from '../../../util/gamelab/TestableP5Wrapper';
import CoreLibrary from '@cdo/apps/p5lab/spritelab/CoreLibrary';
import {commands} from '@cdo/apps/p5lab/spritelab/commands/validationCommands';
import {commands as worldCommands} from '@cdo/apps/p5lab/spritelab/commands/worldCommands';
import {MAX_NUM_TEXTS} from '@cdo/apps/p5lab/spritelab/constants';

describe('Validation Commands', () => {
  let coreLibrary;

  beforeEach(function () {
    const p5Wrapper = createP5Wrapper();
    coreLibrary = new CoreLibrary(p5Wrapper.p5);
  });

  it('getTitle', () => {
    expect(commands.getTitle.apply(coreLibrary)).to.deep.equal({
      title: undefined,
      subtitle: undefined,
    });
    worldCommands.showTitleScreen.apply(coreLibrary, [
      'my title',
      'my subtitle',
    ]);
    expect(commands.getTitle.apply(coreLibrary)).to.deep.equal({
      title: 'my title',
      subtitle: 'my subtitle',
    });
    worldCommands.hideTitleScreen.apply(coreLibrary);
    expect(commands.getTitle.apply(coreLibrary)).to.deep.equal({
      title: undefined,
      subtitle: undefined,
    });
  });

  it('getPrintLog', () => {
    expect(commands.getPrintLog.apply(coreLibrary)).to.deep.equal([]);
    worldCommands.printText.apply(coreLibrary, ['first']);
    expect(commands.getPrintLog.apply(coreLibrary)).to.deep.equal(['first']);
    worldCommands.printText.apply(coreLibrary, ['second']);
    expect(commands.getPrintLog.apply(coreLibrary)).to.deep.equal([
      'first',
      'second',
    ]);
    worldCommands.printText.apply(coreLibrary, ['third']);
    expect(commands.getPrintLog.apply(coreLibrary)).to.deep.equal([
      'first',
      'second',
      'third',
    ]);
  });

  it(`prints last ${MAX_NUM_TEXTS} statements when there are more than ${MAX_NUM_TEXTS} print commands`, () => {
    let expectedArray = [];
    for (let i = 1; i <= MAX_NUM_TEXTS + 100; i++) {
      worldCommands.printText.apply(coreLibrary, [i]);
      if (i > 100) {
        expectedArray.push(i);
      }
      // expectedArray contains numbers from 111 to 1100 (last MAX_NUM_TEXTS numbers)
    }
    expect(commands.getPrintLog.apply(coreLibrary)).to.deep.equal(
      expectedArray
    );
  });

  it('getPromptVars', () => {
    expect(commands.getPromptVars.apply(coreLibrary)).to.deep.equal({});
    worldCommands.setPrompt.apply(coreLibrary, [
      'prompt text',
      'myVar1',
      () => {},
    ]);
    worldCommands.setPrompt.apply(coreLibrary, [
      'prompt text',
      'myVar2',
      () => {},
    ]);
    worldCommands.setPromptWithChoices.apply(coreLibrary, [
      'prompt text',
      'myVar3',
      'a',
      'b',
      'c',
      () => {},
    ]);
    worldCommands.setPromptWithChoices.apply(coreLibrary, [
      'prompt text',
      'myVar4',
      1,
      2,
      3,
      () => {},
    ]);
    expect(commands.getPromptVars.apply(coreLibrary)).to.deep.equal({
      myVar1: null,
      myVar2: null,
      myVar3: null,
      myVar4: null,
    });
    coreLibrary.onPromptAnswer('myVar2', 'my answer');
    coreLibrary.onPromptAnswer('myVar3', 2);
  });
});
