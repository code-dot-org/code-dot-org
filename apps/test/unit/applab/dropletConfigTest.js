/** @file Test applab droplet config behavior */
import sinon from 'sinon';
import {expect} from '../../util/configuredChai';
import {replaceOnWindow, restoreOnWindow} from '../../util/testUtils';
import { blocks } from '@cdo/apps/applab/dropletConfig';
import * as api from '@cdo/apps/applab/api';
import * as commands from '@cdo/apps/applab/commands';

describe(`timedLoop(ms, callback)`, () => {
  it('is an exported block with expected configuration', () => {
    const timedLoopBlocks = blocks.filter(block => block.func === 'timedLoop');
    expect(timedLoopBlocks).to.have.length(1);
    const timedLoopBlock = timedLoopBlocks[0];
    expect(timedLoopBlock.func).to.equal('timedLoop');
    expect(timedLoopBlock.category).to.equal('Control');
    expect(timedLoopBlock.paletteParams).to.deep.equal(['ms', 'callback']);
    expect(timedLoopBlock.params).to.deep.equal(['1000', 'function() {\n  \n}']);
  });

  it('has a matching export in api.js', () => {
    expect(api).to.haveOwnProperty('timedLoop');
    expect(api.timedLoop).to.be.a('function');
  });

  describe('api passthrough', () => {
    beforeEach(() => {
      replaceOnWindow('Applab', {
        executeCmd: sinon.spy()
      });
    });

    afterEach(() => {
      restoreOnWindow('Applab');
    });

    it('api call passes arguments through to Applab.executeCmd', () => {
      const ms = 234;
      const callback = () => {};
      api.timedLoop(ms, callback);
      expect(Applab.executeCmd).to.have.been.calledWith(null, 'timedLoop', {ms, callback});
    });
  });


  it('has a matching export in commands.js', () => {
    expect(commands).to.haveOwnProperty('timedLoop');
    expect(commands.timedLoop).to.be.a('function');
  });
});

describe(`stopTimedLoop([key])`, () => {
  it('is an exported block with expected configuration', () => {
    const stopTimedLoopBlocks = blocks.filter(block => block.func === 'stopTimedLoop');
    expect(stopTimedLoopBlocks).to.have.length(1);
    const stopTimedLoopBlock = stopTimedLoopBlocks[0];
    expect(stopTimedLoopBlock.func).to.equal('stopTimedLoop');
    expect(stopTimedLoopBlock.category).to.equal('Control');
    expect(stopTimedLoopBlock.paramButtons).to.deep.equal({ minArgs: 0, maxArgs: 1 });
  });

  it('has a matching export in api.js', () => {
    expect(api).to.haveOwnProperty('stopTimedLoop');
    expect(api.stopTimedLoop).to.be.a('function');
  });

  describe('api passthrough', () => {
    beforeEach(() => {
      replaceOnWindow('Applab', {
        executeCmd: sinon.spy()
      });
    });

    afterEach(() => {
      restoreOnWindow('Applab');
    });

    it('api call passes arguments through to Applab.executeCmd', () => {
      const key = 1987;
      api.stopTimedLoop(key);
      expect(Applab.executeCmd).to.have.been.calledWith(null, 'stopTimedLoop', {key});
    });
  });


  it('has a matching export in commands.js', () => {
    expect(commands).to.haveOwnProperty('stopTimedLoop');
    expect(commands.stopTimedLoop).to.be.a('function');
  });
});
