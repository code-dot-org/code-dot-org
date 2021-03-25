import _ from 'lodash';
import {expect} from '../../../../util/deprecatedChai';
import {
  CIRCUIT_PLAYGROUND_PORTS,
  CIRCUIT_PLAYGROUND_EXPRESS_PORTS,
  MICROBIT_PORTS,
  REDBOARD_PORTS,
  FLORA_PORTS,
  OSX_DEFAULT_PORTS,
  OTHER_BAD_SERIALPORTS
} from './sampleSerialPorts';
import ChromeSerialPort from 'chrome-serialport'; // Actually StubChromeSerialPort
import {ConnectionFailedError} from '@cdo/apps/lib/kits/maker/MakerError';
import {
  findPortWithViableDevice,
  getPreferredPort
} from '@cdo/apps/lib/kits/maker/portScanning';
import sinon from 'sinon';

describe('maker/portScanning.js', function() {
  let userAgentSpy;
  describe(`findPortWithViableDevice()`, () => {
    beforeEach(() => {
      // 'CrOS' represents ChromeOS
      userAgentSpy = sinon.stub(navigator, 'userAgent').value('CrOS');
    });

    // Testing against StubChromeSerialPort.js
    afterEach(() => {
      ChromeSerialPort.stub.reset();
      userAgentSpy.restore();
    });

    it('resolves with a port if a viable device is found', () => {
      ChromeSerialPort.stub.setDeviceList(CIRCUIT_PLAYGROUND_PORTS);
      return findPortWithViableDevice().then(port => {
        expect(port.comName).to.equal('COM5');
        expect(port.productId).to.equal('0x8011');
      });
    });

    it('rejects if no viable device is found', done => {
      ChromeSerialPort.stub.setDeviceList(OTHER_BAD_SERIALPORTS);
      findPortWithViableDevice()
        .then(port => {
          done(
            new Error(
              'Expected promise to reject, but it resolved to ' + port.comName
            )
          );
        })
        .catch(err => {
          expect(err).to.be.an.instanceOf(ConnectionFailedError);
          expect(err.message).to.equal(
            'Failed to establish a board connection.'
          );
          expect(err.reason).to.include(
            'Did not find a usable device on a serial port.'
          );
          expect(err.reason).to.include(JSON.stringify(OTHER_BAD_SERIALPORTS));
          done();
        })
        .catch(done);
    });

    it(`allows the Circuit Playground Express`, () => {
      ChromeSerialPort.stub.setDeviceList(CIRCUIT_PLAYGROUND_EXPRESS_PORTS);
      return findPortWithViableDevice().then(port => {
        expect(port.comName).to.equal('COM5');
        expect(port.productId).to.equal('8018');
      });
    });

    it(`allows the micro:bit`, () => {
      ChromeSerialPort.stub.setDeviceList(MICROBIT_PORTS);
      return findPortWithViableDevice().then(port => {
        expect(port.comName).to.equal('COM3');
        expect(port.productId).to.equal('0204');
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
          ...MICROBIT_PORTS,
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
          ...MICROBIT_PORTS,
          ...FLORA_PORTS,
          ...REDBOARD_PORTS,
          ...OSX_DEFAULT_PORTS,
          ...OTHER_BAD_SERIALPORTS
        ]);
        expect(getPreferredPort(ports)).to.equal(expressPort);
      });
    });

    it('picks a micro:bit over unknown Adafruit product or other ports', () => {
      MICROBIT_PORTS.forEach(mbPort => {
        const ports = _.shuffle([
          mbPort,
          ...FLORA_PORTS,
          ...REDBOARD_PORTS,
          ...OSX_DEFAULT_PORTS,
          ...OTHER_BAD_SERIALPORTS
        ]);
        expect(getPreferredPort(ports)).to.equal(mbPort);
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
      const ports = [...OSX_DEFAULT_PORTS, ...OTHER_BAD_SERIALPORTS];
      expect(getPreferredPort(ports)).to.be.undefined;
    });
  });
});
