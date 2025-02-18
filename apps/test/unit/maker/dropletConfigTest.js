/** @file Test maker droplet config behavior */
import {CP_COMPONENT_EVENTS} from '@cdo/apps/maker/boards/circuitPlayground/PlaygroundConstants';
import {MB_COMPONENT_EVENTS} from '@cdo/apps/maker/boards/microBit/MicroBitConstants';
import * as commands from '@cdo/apps/maker/commands';
import dropletConfig, {configMicrobit} from '@cdo/apps/maker/dropletConfig';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('maker/dropletConfig.js', () => {
  describe('getBoardEventDropdownForParam', () => {
    it('unknown first parameter dropdown contains all options', () => {
      expect(
        dropletConfig.getBoardEventDropdownForParam(
          'unknown',
          CP_COMPONENT_EVENTS
        )
      ).to.deep.equal([
        '"change"',
        '"close"',
        '"data"',
        '"down"',
        '"open"',
        '"shake"',
        '"up"',
      ]);
    });

    it('buttonL dropdown', () => {
      expect(
        dropletConfig.getBoardEventDropdownForParam(
          'buttonL',
          CP_COMPONENT_EVENTS
        )
      ).to.deep.equal(['"down"', '"up"']);
    });

    it('buttonR dropdown', () => {
      expect(
        dropletConfig.getBoardEventDropdownForParam(
          'buttonR',
          CP_COMPONENT_EVENTS
        )
      ).to.deep.equal(['"down"', '"up"']);
    });

    it('toggleSwitch dropdown', () => {
      expect(
        dropletConfig.getBoardEventDropdownForParam(
          'toggleSwitch',
          CP_COMPONENT_EVENTS
        )
      ).to.deep.equal(['"change"', '"close"', '"open"']);
    });

    it('accelerometer dropdown', () => {
      expect(
        dropletConfig.getBoardEventDropdownForParam(
          'accelerometer',
          CP_COMPONENT_EVENTS
        )
      ).to.deep.equal(['"change"', '"data"', '"shake"']);
    });

    it('soundSensor dropdown', () => {
      expect(
        dropletConfig.getBoardEventDropdownForParam(
          'soundSensor',
          CP_COMPONENT_EVENTS
        )
      ).to.deep.equal(['"change"', '"data"']);
    });

    it('lightSensor dropdown', () => {
      expect(
        dropletConfig.getBoardEventDropdownForParam(
          'lightSensor',
          CP_COMPONENT_EVENTS
        )
      ).to.deep.equal(['"change"', '"data"']);
    });

    it('tempSensor dropdown', () => {
      expect(
        dropletConfig.getBoardEventDropdownForParam(
          'tempSensor',
          CP_COMPONENT_EVENTS
        )
      ).to.deep.equal(['"change"', '"data"']);
    });

    // micro:bit specific components
    it('buttonA dropdown', () => {
      expect(
        dropletConfig.getBoardEventDropdownForParam(
          'buttonA',
          MB_COMPONENT_EVENTS
        )
      ).to.deep.equal(['"down"', '"up"']);
    });

    it('buttonB dropdown', () => {
      expect(
        dropletConfig.getBoardEventDropdownForParam(
          'buttonB',
          MB_COMPONENT_EVENTS
        )
      ).to.deep.equal(['"down"', '"up"']);
    });
  });

  describe('stringifySong', () => {
    it('formats note arrays indented with one note per line', () => {
      expect(
        dropletConfig.stringifySong([
          ['A1', 1 / 4],
          ['B2', 1 / 4],
          ['C3', 1 / 2],
        ])
      ).to.equal('[' + '["A1",0.25], ' + '["B2",0.25], ' + '["C3",0.5]' + ']');
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
      block = configMicrobit.blocks.find(x => x.func === 'createLed');
    });

    it('is an exported block', () => {
      expect(block).not.to.be.undefined;
    });

    it('is in the Maker category', () => {
      expect(block).to.have.property('category', dropletConfig.MAKER_CATEGORY);
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
      block = configMicrobit.blocks.find(
        x => x.func === 'var myLed = createLed'
      );
    });

    it('is an exported block', () => {
      expect(block).not.to.be.undefined;
    });

    it('is in the Maker category', () => {
      expect(block).to.have.property('category', dropletConfig.MAKER_CATEGORY);
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

  describe(`createButton(pin)`, () => {
    let block;

    beforeEach(() => {
      block = configMicrobit.blocks.find(x => x.func === 'createButton');
    });

    it('is an exported block', () => {
      expect(block).not.to.be.undefined;
    });

    it('is in the Maker category', () => {
      expect(block).to.have.property('category', dropletConfig.MAKER_CATEGORY);
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
      expect(commands).to.haveOwnProperty('createButton');
      expect(commands.createButton).to.be.a('function');
    });
  });

  describe(`var myButton = createButton(pin)`, () => {
    let block;

    beforeEach(() => {
      block = configMicrobit.blocks.find(
        x => x.func === 'var myButton = createButton'
      );
    });

    it('is an exported block', () => {
      expect(block).not.to.be.undefined;
    });

    it('is in the Maker category', () => {
      expect(block).to.have.property('category', dropletConfig.MAKER_CATEGORY);
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
