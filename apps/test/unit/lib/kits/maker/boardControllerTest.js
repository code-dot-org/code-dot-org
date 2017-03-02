import _ from 'lodash';
import sinon from 'sinon';
import {expect} from '../../../../util/configuredChai';
import {
  CIRCUIT_PLAYGROUND_PORTS,
  REDBOARD_PORTS,
  FLORA_PORTS,
  OSX_DEFAULT_PORTS,
  OTHER_BAD_SERIALPORTS
} from './sampleSerialPorts';
import BoardController from '@cdo/apps/lib/kits/maker/BoardController';

describe("BoardController", function () {
  describe(`getPreferredPort(portList)`, () => {
    it('picks out an Adafruit Circuit Playground if there are multiple ports', () => {
      CIRCUIT_PLAYGROUND_PORTS.forEach(circuitPlaygroundPort => {
        // Try random port order to prove that it doesn't matter
        const ports = _.shuffle([
          circuitPlaygroundPort,
          ...FLORA_PORTS,
          ...REDBOARD_PORTS,
          ...OSX_DEFAULT_PORTS,
          ...OTHER_BAD_SERIALPORTS
        ]);
        expect(BoardController.getPreferredPort(ports)).to.equal(circuitPlaygroundPort);
      });
    });

    it('picks another Adafruit product over other ports', () => {
      FLORA_PORTS.forEach(floraPort => {
        const ports = _.shuffle([
          floraPort,
          ...REDBOARD_PORTS,
          ...OSX_DEFAULT_PORTS,
          ...OTHER_BAD_SERIALPORTS
        ]);
        expect(BoardController.getPreferredPort(ports)).to.equal(floraPort);
      });
    });

    it('picks another possibly valid port over known bad ports', () => {
      REDBOARD_PORTS.forEach(redboardPort => {
        const ports = _.shuffle([
          redboardPort,
          ...OSX_DEFAULT_PORTS,
          ...OTHER_BAD_SERIALPORTS
        ]);
        expect(BoardController.getPreferredPort(ports)).to.equal(redboardPort);
      });
    });

    it('will not pick a known bad port', () => {
      const ports = [
        ...OSX_DEFAULT_PORTS,
        ...OTHER_BAD_SERIALPORTS
      ];
      expect(BoardController.getPreferredPort(ports)).to.be.undefined;
    });
  });

  describe('event aliases', function () {
    let boardController, fakeEventEmitter, callback;

    beforeEach(function () {
      boardController = new BoardController();
      fakeEventEmitter = { on: sinon.spy() };
      callback = () => {};
    });

    it(`aliases 'tap:single' event to 'singleTap'`, function () {
      boardController.onBoardEvent(fakeEventEmitter, 'singleTap', callback);
      expect(fakeEventEmitter.on).to.have.been.calledWith('tap:single', callback);
    });

    it(`aliases 'tap:double' event to 'doubleTap'`, function () {
      boardController.onBoardEvent(fakeEventEmitter, 'doubleTap', callback);
      expect(fakeEventEmitter.on).to.have.been.calledWith('tap:double', callback);
    });
  });
});
