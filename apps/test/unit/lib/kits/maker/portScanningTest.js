import _ from 'lodash';
import {expect} from '../../../../util/configuredChai';
import {
  CIRCUIT_PLAYGROUND_PORTS,
  REDBOARD_PORTS,
  FLORA_PORTS,
  OSX_DEFAULT_PORTS,
  OTHER_BAD_SERIALPORTS
} from './sampleSerialPorts';
import StubChromeSerialPort from './StubChromeSerialPort';
import {
  findPortWithViableDevice,
  getPreferredPort,
  __RewireAPI__
} from '@cdo/apps/lib/kits/maker/portScanning';

describe("Maker Toolkit", function () {
  describe(`findPortWithViableDevice()`, () => {
    beforeEach(() => {
      __RewireAPI__.__Rewire__('ChromeSerialPort', StubChromeSerialPort);
    });

    // Testing against StubChromeSerialPort.js
    afterEach(() => {
      StubChromeSerialPort.stub.reset();
      __RewireAPI__.__ResetDependency__('ChromeSerialPort');
    });

    it('resolves with a port if a viable device is found', () => {
      StubChromeSerialPort.stub.setDeviceList(CIRCUIT_PLAYGROUND_PORTS);
      return findPortWithViableDevice()
          .then(port => {
            expect(port).to.equal('COM5');
          });
    });

    it('rejects if no viable device is found', done => {
      StubChromeSerialPort.stub.setDeviceList(OTHER_BAD_SERIALPORTS);
      findPortWithViableDevice()
          .then(port => {
            done(new Error('Expected promise to reject, but it resolved to ' + port));
          })
          .catch(err => {
            expect(err.message).to.equal('Did not find a usable device on a serial port.');
            done();
          })
          .catch(done);
    });
  });

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
