import _ from 'lodash';
import {expect} from '../../../../util/configuredChai';
import {
  CIRCUIT_PLAYGROUND_PORTS,
  REDBOARD_PORTS,
  FLORA_PORTS,
  OSX_DEFAULT_PORTS,
  OTHER_BAD_SERIALPORTS
} from './sampleSerialPorts';
import {getPreferredPort} from '@cdo/apps/lib/kits/maker/portScanning';

describe("Maker Toolkit", function () {
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
        expect(getPreferredPort(ports)).to.equal(circuitPlaygroundPort);
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
        expect(getPreferredPort(ports)).to.equal(floraPort);
      });
    });

    it('picks another possibly valid port over known bad ports', () => {
      REDBOARD_PORTS.forEach(redboardPort => {
        const ports = _.shuffle([
          redboardPort,
          ...OSX_DEFAULT_PORTS,
          ...OTHER_BAD_SERIALPORTS
        ]);
        expect(getPreferredPort(ports)).to.equal(redboardPort);
      });
    });

    it('will not pick a known bad port', () => {
      const ports = [
        ...OSX_DEFAULT_PORTS,
        ...OTHER_BAD_SERIALPORTS
      ];
      expect(getPreferredPort(ports)).to.be.undefined;
    });
  });
});
