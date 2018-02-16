import _ from 'lodash';
import {expect} from '../../../../util/configuredChai';
import {
  CIRCUIT_PLAYGROUND_PORTS,
  CIRCUIT_PLAYGROUND_EXPRESS_PORTS,
  REDBOARD_PORTS,
  FLORA_PORTS,
  OSX_DEFAULT_PORTS,
  OTHER_BAD_SERIALPORTS,
} from './sampleSerialPorts';
import ChromeSerialPort from 'chrome-serialport'; // Actually StubChromeSerialPort
import {ConnectionFailedError} from '@cdo/apps/lib/kits/maker/MakerError';
import {
  findPortWithViableDevice,
  getPreferredPort,
  CIRCUIT_PLAYGROUND_EXPRESS_EXPERIMENT,
} from '@cdo/apps/lib/kits/maker/portScanning';
import experiments from '@cdo/apps/util/experiments';

describe("maker/portScanning.js", function () {
  // Unit tests assume no support for CPX, unless they explicitly enable it.
  beforeEach(() => experiments.setEnabled(CIRCUIT_PLAYGROUND_EXPRESS_EXPERIMENT, false));

  describe(`findPortWithViableDevice()`, () => {
    // Testing against StubChromeSerialPort.js
    afterEach(() => {
      ChromeSerialPort.stub.reset();
    });

    it('resolves with a port if a viable device is found', () => {
      ChromeSerialPort.stub.setDeviceList(CIRCUIT_PLAYGROUND_PORTS);
      return findPortWithViableDevice()
          .then(port => {
            expect(port).to.equal('COM5');
          });
    });

    it('rejects if no viable device is found', done => {
      ChromeSerialPort.stub.setDeviceList(OTHER_BAD_SERIALPORTS);
      findPortWithViableDevice()
          .then(port => {
            done(new Error('Expected promise to reject, but it resolved to ' + port));
          })
          .catch(err => {
            expect(err).to.be.an.instanceOf(ConnectionFailedError);
            expect(err.message).to.equal('Failed to establish a board connection.');
            expect(err.reason).to.include('Did not find a usable device on a serial port.');
            expect(err.reason).to.include(JSON.stringify(OTHER_BAD_SERIALPORTS));
            done();
          })
          .catch(done);
    });

    it('rejects if the best device is a Circuit Playground Express', done => {
      expect(experiments.isEnabled(CIRCUIT_PLAYGROUND_EXPRESS_EXPERIMENT)).to.be.false;
      ChromeSerialPort.stub.setDeviceList(CIRCUIT_PLAYGROUND_EXPRESS_PORTS);
      findPortWithViableDevice()
        .then(port => {
          done(new Error('Expected promise to reject, but it resolved to ' + port));
        })
        .catch(err => {
          expect(err).to.be.an.instanceOf(ConnectionFailedError);
          expect(err.message).to.equal('Failed to establish a board connection.');
          expect(err.reason).to.include("It looks like you've connected a Circuit Playground Express.");
          expect(err.reason).to.include("Code.org Maker Toolkit does not support the Express at this time.");
          expect(err.reason).to.include("Please connect a Circuit Playground Developer Edition and try again.");
          done();
        })
        .catch(done);
    });

    describe(`with experiment ${CIRCUIT_PLAYGROUND_EXPRESS_EXPERIMENT}`, () => {
      beforeEach(() => experiments.setEnabled(CIRCUIT_PLAYGROUND_EXPRESS_EXPERIMENT, true));
      afterEach(() => experiments.setEnabled(CIRCUIT_PLAYGROUND_EXPRESS_EXPERIMENT, false));

      it(`allows the Circuit Playground Express`, () => {
        ChromeSerialPort.stub.setDeviceList(CIRCUIT_PLAYGROUND_EXPRESS_PORTS);
        return findPortWithViableDevice()
          .then(port => {
            expect(port).to.equal('COM5');
          });
      });
    });

  });

  describe(`getPreferredPort(portList)`, () => {
    it('picks out an Adafruit Circuit Playground if there are multiple ports', () => {
      CIRCUIT_PLAYGROUND_PORTS.forEach(circuitPlaygroundPort => {
        // Try random port order to prove that it doesn't matter
        const ports = _.shuffle([
          circuitPlaygroundPort,
          ...CIRCUIT_PLAYGROUND_EXPRESS_PORTS,
          ...FLORA_PORTS,
          ...REDBOARD_PORTS,
          ...OSX_DEFAULT_PORTS,
          ...OTHER_BAD_SERIALPORTS
        ]);
        expect(getPreferredPort(ports)).to.deep.equal(circuitPlaygroundPort);
      });
    });

    it('picks a Circuit Playground Express over other ports', () => {
      CIRCUIT_PLAYGROUND_EXPRESS_PORTS.forEach(expressPort => {
        const ports = _.shuffle([
          expressPort,
          ...FLORA_PORTS,
          ...REDBOARD_PORTS,
          ...OSX_DEFAULT_PORTS,
          ...OTHER_BAD_SERIALPORTS,
        ]);
        expect(getPreferredPort(ports)).to.equal(expressPort);
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
