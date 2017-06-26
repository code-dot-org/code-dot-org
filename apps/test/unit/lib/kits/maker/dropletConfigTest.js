/** @file Test maker droplet config behavior */
import {expect} from '../../../../util/configuredChai';
import {
  blocks,
  getBoardEventDropdownForParam,
  stringifySong,
  MAKER_CATEGORY,
} from '@cdo/apps/lib/kits/maker/dropletConfig';
import * as commands from '@cdo/apps/lib/kits/maker/commands';

describe('maker/dropletConfig.js', () => {
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

    // TODO (bbuchanan): Enable when captouch is on by default
    describe.skip('touchPads', () => {
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
      );
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

  describe(`createLed(pin)`, () => {
    let block;

    beforeEach(() => {
      block = blocks.find(x => x.func === 'createLed');
    });

    it('is an exported block', () => {
      expect(block).not.to.be.undefined;
    });

    it('is in the Maker category', () => {
      expect(block).to.have.property('category', MAKER_CATEGORY);
    });

    it('has one argument', () => {
      expect(block.paletteParams).to.have.length(1);
      expect(block.params).to.have.length(1);
      expect(block.paletteParams[0]).to.equal('pin');
      expect(block.params[0]).to.equal('0');
    });

    it('can be a value block or not', () => {
      expect(block.type).to.equal('either');
    });

    it('has a matching export in commands.js', () => {
      expect(commands).to.haveOwnProperty('createLed');
      expect(commands.createLed).to.be.a('function');
    });
  });

  describe(`var myLed = createLed(pin)`, () => {
    let block;

    beforeEach(() => {
      block = blocks.find(x => x.func === 'var myLed = createLed');
    });

    it('is an exported block', () => {
      expect(block).not.to.be.undefined;
    });

    it('is in the Maker category', () => {
      expect(block).to.have.property('category', MAKER_CATEGORY);
    });

    it('has one argument', () => {
      expect(block.paletteParams).to.have.length(1);
      expect(block.params).to.have.length(1);
      expect(block.paletteParams[0]).to.equal('pin');
      expect(block.params[0]).to.equal('0');
    });

    it('does not autocomplete', () => {
      expect(block.noAutocomplete).to.be.true;
    });
  });

  describe(`onBoardEvent(component, event, callback)`, () => {
    it('has a matching export in commands.js', () => {
      expect(commands).to.haveOwnProperty('onBoardEvent');
      expect(commands.onBoardEvent).to.be.a('function');
    });
  });
});
