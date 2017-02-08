/** @file Test maker droplet config behavior */
import {expect} from '../../../../util/configuredChai';
import {stubWindowApplab} from '../../../../util/testUtils';
import sinon from 'sinon';
import {
  blocks,
  getBoardEventDropdownForParam,
  MAKER_CATEGORY
} from '@cdo/apps/lib/kits/maker/dropletConfig';
import * as api from '@cdo/apps/lib/kits/maker/api';
import commands from '@cdo/apps/lib/kits/maker/commands';

describe('getBoardEventDropdownForParam', function () {
  it('unknown first parameter dropdown contains all options', function () {
    expect(getBoardEventDropdownForParam('unknown')).to.deep.equal([
      '"change"',
      '"close"',
      '"data"',
      '"doubleTap"',
      '"down"',
      '"open"',
      '"press"',
      '"singleTap"',
      '"up"'
    ]);
  });

  it('buttonL dropdown', function () {
    expect(getBoardEventDropdownForParam('buttonL')).to.deep.equal([
      '"down"',
      '"press"',
      '"up"'
    ]);
  });

  it('buttonR dropdown', function () {
    expect(getBoardEventDropdownForParam('buttonR')).to.deep.equal([
      '"down"',
      '"press"',
      '"up"'
    ]);
  });

  it('toggleSwitch dropdown', function () {
    expect(getBoardEventDropdownForParam('toggleSwitch')).to.deep.equal([
      '"close"',
      '"open"'
    ]);
  });

  it('accelerometer dropdown', function () {
    expect(getBoardEventDropdownForParam('accelerometer')).to.deep.equal([
      '"change"',
      '"data"',
      '"doubleTap"',
      '"singleTap"'
    ]);
  });

  it('soundSensor dropdown', function () {
    expect(getBoardEventDropdownForParam('soundSensor')).to.deep.equal([
      '"change"',
      '"data"'
    ]);
  });

  it('lightSensor dropdown', function () {
    expect(getBoardEventDropdownForParam('lightSensor')).to.deep.equal([
      '"change"',
      '"data"'
    ]);
  });

  it('tempSensor dropdown', function () {
    expect(getBoardEventDropdownForParam('tempSensor')).to.deep.equal([
      '"change"',
      '"data"'
    ]);
  });

  describe('touchPads', function () {
    [0, 1, 2, 3, 6, 9, 10, 12].forEach(pin => {
      it(`touchPad${pin} dropdown`, function () {
        expect(getBoardEventDropdownForParam(`touchPad${pin}`)).to.deep.equal([
          '"down"',
          '"up"'
        ]);
      });
    });
  });
});

// TODO (bbuchanan): Replace with more general assertions when we move maker
// commands back to this kit.
describe(`timedLoop(ms, callback)`, function () {
  it('is an exported block with expected configuration', function () {
    const timedLoopBlocks = blocks.filter(block => block.func === 'timedLoop');
    expect(timedLoopBlocks).to.have.length(1);
    const timedLoopBlock = timedLoopBlocks[0];
    expect(timedLoopBlock.func).to.equal('timedLoop');
    expect(timedLoopBlock.category).to.equal(MAKER_CATEGORY);
    expect(timedLoopBlock.paletteParams).to.deep.equal(['ms', 'callback']);
    expect(timedLoopBlock.params).to.deep.equal(['1000', 'function(exit) {\n  \n}']);
  });

  it('has a matching export in api.js', function () {
    expect(api).to.haveOwnProperty('timedLoop');
    expect(api.timedLoop).to.be.a('function');
  });

  describe('api passthrough', function () {
    stubWindowApplab();

    it('api call passes arguments through to Applab.executeCmd', function () {
      const ms = 234;
      const callback = function () {};
      api.timedLoop(ms, callback);
      expect(window.Applab.executeCmd).to.have.been.calledWith(null, 'timedLoop', {ms, callback});
    });
  });


  it('has a matching export in commands.js', function () {
    expect(commands).to.haveOwnProperty('timedLoop');
    expect(commands.timedLoop).to.be.a('function');
  });

  it('runs code on an interval', function () {
    const clock = sinon.useFakeTimers();

    const spy = sinon.spy();
    let stopLoop;
    commands.timedLoop({
      ms: 50,
      callback: exit => {
        stopLoop = exit;
        spy();
      }
    });

    expect(spy).not.to.have.been.called;

    clock.tick(49);
    expect(spy).not.to.have.been.called;

    clock.tick(1);
    expect(spy).to.have.been.calledOnce;

    clock.tick(50);
    expect(spy).to.have.been.calledTwice;

    stopLoop();
    clock.tick(50);
    expect(spy).to.have.been.calledTwice;

    clock.restore();
  });
});
