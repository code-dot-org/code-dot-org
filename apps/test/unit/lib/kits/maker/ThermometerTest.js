/** @file Test the Thermometer controller wrapping playground-io Thermometer */
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import Thermometer, {
  MicroBitThermometer
} from '@cdo/apps/lib/kits/maker/Thermometer';
import Playground from 'playground-io';
import {MicrobitStubBoard} from './makeStubBoard';
import {sensor_channels} from '@cdo/apps/lib/kits/maker/MicroBitConstants';

describe('Thermometer', function() {
  let testObj;

  beforeEach(() => {
    sinon.stub(Playground.Thermometer.initialize, 'value');
    testObj = {};
  });

  afterEach(() => {
    Playground.Thermometer.initialize.value.restore();
  });

  it(`adds 'raw' and 'value' attributes in the initialize() method`, () => {
    expect(testObj).not.to.haveOwnProperty('raw');
    expect(testObj).not.to.haveOwnProperty('value');

    // These tests are a little odd because Thermometer is sort of a 'controller
    // template' consumed by Johnny-Five - thus we test individual methods by
    // calling them with a particular 'this'.
    Thermometer.initialize.value.call(testObj);
    expect(testObj).to.haveOwnProperty('raw');
    expect(testObj).to.haveOwnProperty('value');

    // Check that call passes through to 'parent' controller, too.
    expect(Playground.Thermometer.initialize.value).to.have.been.calledOnce;
  });

  it(`'raw' and 'value' attributes are readonly`, () => {
    Thermometer.initialize.value.call(testObj);

    const rawDesc = Object.getOwnPropertyDescriptor(testObj, 'raw');
    expect(rawDesc.set).to.be.undefined;

    const valueDesc = Object.getOwnPropertyDescriptor(testObj, 'value');
    expect(valueDesc.set).to.be.undefined;
  });

  it(`value is still translated to celsius`, () => {
    Thermometer.initialize.value.call(testObj);
    expect(Thermometer.toCelsius.value.call(testObj, 0)).to.equal(-273);
    expect(Thermometer.toCelsius.value.call(testObj, 1)).to.equal(-77);
    expect(Thermometer.toCelsius.value.call(testObj, 15)).to.equal(-47);
    expect(Thermometer.toCelsius.value.call(testObj, 230)).to.equal(0);
    expect(Thermometer.toCelsius.value.call(testObj, 512)).to.equal(25);
    expect(Thermometer.toCelsius.value.call(testObj, 1022)).to.equal(352);
    expect(Thermometer.toCelsius.value.call(testObj, 1023)).to.equal(-273); // ?
  });

  it(`raw sensor value passed to 'toCelsius' becomes new 'raw' and 'value' value`, () => {
    Thermometer.initialize.value.call(testObj);
    for (let i = 0; i < 1024; i++) {
      Thermometer.toCelsius.value.call(testObj, i);
      expect(testObj.raw)
        .to.equal(testObj.value)
        .to.equal(i);
    }
  });
});

describe('MicroBitThermometer', function() {
  let boardClient;
  let thermometer;

  beforeEach(() => {
    boardClient = new MicrobitStubBoard();
    thermometer = new MicroBitThermometer({mb: boardClient});
  });

  it(`attributes are readonly`, () => {
    let attributes = ['raw', 'celsius', 'fahrenheit', 'C', 'F'];
    let descriptor;

    attributes.forEach(attr => {
      descriptor = Object.getOwnPropertyDescriptor(thermometer, attr);
      expect(descriptor.set).to.be.undefined;
      expect(descriptor.get).to.be.defined;
    });
  });

  it(`fahrenheit is calculated from celsius`, () => {
    // Seed the temp channel with celsius data
    boardClient.analogChannel[sensor_channels.tempSensor] = 3;

    expect(thermometer.celsius).to.equal(thermometer.C);
    expect(thermometer.celsius).to.equal(3);

    expect(thermometer.fahrenheit).to.equal(thermometer.F);
    expect(thermometer.fahrenheit).to.equal(37.4);
  });

  describe(`start() and stop()`, () => {
    it(`trigger the parent call`, () => {
      let startSpy = sinon.spy(boardClient, 'streamAnalogChannel');
      let stopSpy = sinon.spy(boardClient, 'stopStreamingAnalogChannel');
      thermometer.start();
      expect(startSpy).to.have.been.calledOnce;
      expect(startSpy).to.have.been.calledWith(sensor_channels.tempSensor);

      thermometer.stop();
      expect(stopSpy).to.have.been.calledOnce;
      expect(stopSpy).to.have.been.calledWith(sensor_channels.tempSensor);
    });
  });

  describe('emitsEvent', () => {
    let emitSpy;
    beforeEach(() => {
      emitSpy = sinon.spy(thermometer, 'emit');
    });

    it('emits the data event when it receives data', () => {
      boardClient.receivedAnalogUpdate();
      expect(emitSpy).to.have.been.calledOnce;
      expect(emitSpy).to.have.been.calledWith('data');
    });

    it('emits the change event when it receives data that is different from previous', () => {
      // Set the 'current Temp' to 0
      boardClient.receivedAnalogUpdate();

      // Seed the temp channel with 'different' data
      boardClient.analogChannel[sensor_channels.tempSensor] = 3;

      boardClient.receivedAnalogUpdate();
      expect(emitSpy).to.have.been.calledWith('data');
      expect(emitSpy).to.have.been.calledWith('change');
    });
  });
});
