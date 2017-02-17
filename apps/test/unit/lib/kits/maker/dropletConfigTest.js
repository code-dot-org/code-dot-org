/** @file Test maker droplet config behavior */
import {expect} from '../../../../util/configuredChai';
import sinon from 'sinon';
import {
  blocks,
  getBoardEventDropdownForParam,
  MAKER_CATEGORY,
  stringifySong
} from '@cdo/apps/lib/kits/maker/dropletConfig';
import * as api from '@cdo/apps/lib/kits/maker/api';
import * as commands from '@cdo/apps/lib/kits/maker/commands';

describe('getBoardEventDropdownForParam', () => {
  it('unknown first parameter dropdown contains all options', () => {
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

  it('buttonL dropdown', () => {
    expect(getBoardEventDropdownForParam('buttonL')).to.deep.equal([
      '"down"',
      '"press"',
      '"up"'
    ]);
  });

  it('buttonR dropdown', () => {
    expect(getBoardEventDropdownForParam('buttonR')).to.deep.equal([
      '"down"',
      '"press"',
      '"up"'
    ]);
  });

  it('toggleSwitch dropdown', () => {
    expect(getBoardEventDropdownForParam('toggleSwitch')).to.deep.equal([
      '"close"',
      '"open"'
    ]);
  });

  it('accelerometer dropdown', () => {
    expect(getBoardEventDropdownForParam('accelerometer')).to.deep.equal([
      '"change"',
      '"data"',
      '"doubleTap"',
      '"singleTap"'
    ]);
  });

  it('soundSensor dropdown', () => {
    expect(getBoardEventDropdownForParam('soundSensor')).to.deep.equal([
      '"change"',
      '"data"'
    ]);
  });

  it('lightSensor dropdown', () => {
    expect(getBoardEventDropdownForParam('lightSensor')).to.deep.equal([
      '"change"',
      '"data"'
    ]);
  });

  it('tempSensor dropdown', () => {
    expect(getBoardEventDropdownForParam('tempSensor')).to.deep.equal([
      '"change"',
      '"data"'
    ]);
  });

  describe('touchPads', () => {
    [0, 1, 2, 3, 6, 9, 10, 12].forEach(pin => {
      it(`touchPad${pin} dropdown`, () => {
        expect(getBoardEventDropdownForParam(`touchPad${pin}`)).to.deep.equal([
          '"down"',
          '"up"'
        ]);
      });
    });
  });
});

describe('stringifySong', () => {
  it('formats note arrays indented with one note per line', () => {
    expect(stringifySong([['A1', 1/4], ['B2', 1/4], ['C3', 1/2]])).to.equal(
      '[\n' +
      '  ["A1",0.25],\n' +
      '  ["B2",0.25],\n' +
      '  ["C3",0.5]\n' +
      ']'
    )
  });
});

describe(`pinMode(pin, mode)`, () => {
  it('has a matching export in commands.js', () => {
    expect(commands).to.haveOwnProperty('pinMode');
    expect(commands.pinMode).to.be.a('function');
  });
});

describe(`digitalWrite(pin, value)`, () => {
  it('has a matching export in commands.js', () => {
    expect(commands).to.haveOwnProperty('digitalWrite');
    expect(commands.digitalWrite).to.be.a('function');
  });
});

describe(`digitalRead(pin)`, () => {
  it('has a matching export in commands.js', () => {
    expect(commands).to.haveOwnProperty('digitalRead');
    expect(commands.digitalRead).to.be.a('function');
  });
});

describe(`analogWrite(pin, value)`, () => {
  it('has a matching export in commands.js', () => {
    expect(commands).to.haveOwnProperty('analogWrite');
    expect(commands.analogWrite).to.be.a('function');
  });
});

describe(`analogRead(pin)`, () => {
  it('has a matching export in commands.js', () => {
    expect(commands).to.haveOwnProperty('analogRead');
    expect(commands.analogRead).to.be.a('function');
  });
});

describe(`onBoardEvent(component, event, callback)`, () => {
  it('has a matching export in commands.js', () => {
    expect(commands).to.haveOwnProperty('onBoardEvent');
    expect(commands.onBoardEvent).to.be.a('function');
  });
});

// TODO (bbuchanan): Replace with more general assertions when we move maker
// commands back to this kit.
describe(`timedLoop(ms, callback)`, () => {
  it('is an exported block with expected configuration', () => {
    const timedLoopBlocks = blocks.filter(block => block.func === 'timedLoop');
    expect(timedLoopBlocks).to.have.length(1);
    const timedLoopBlock = timedLoopBlocks[0];
    expect(timedLoopBlock.func).to.equal('timedLoop');
    expect(timedLoopBlock.category).to.equal(MAKER_CATEGORY);
    expect(timedLoopBlock.paletteParams).to.deep.equal(['ms', 'callback']);
    expect(timedLoopBlock.params).to.deep.equal(['1000', 'function(exit) {\n  // Call exit() to stop looping\n  exit();\n}']);
  });

  it('has a matching export in api.js', () => {
    expect(api).to.haveOwnProperty('timedLoop');
    expect(api.timedLoop).to.be.a('function');
  });

  describe('api passthrough', () => {
    let spy;

    beforeEach(() => {
      spy = sinon.spy();
      api.injectExecuteCmd(spy);
    });

    afterEach(() => {
      api.injectExecuteCmd(undefined);
    });

    it('api call passes arguments through to Applab.executeCmd', () => {
      const ms = 234;
      const callback = () => {};
      api.timedLoop(ms, callback);
      expect(spy).to.have.been.calledWith(null, 'timedLoop', {ms, callback});
    });
  });


  it('has a matching export in commands.js', () => {
    expect(commands).to.haveOwnProperty('timedLoop');
    expect(commands.timedLoop).to.be.a('function');
  });
});
