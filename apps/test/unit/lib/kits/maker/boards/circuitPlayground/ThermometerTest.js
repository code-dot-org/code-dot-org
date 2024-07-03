/** @file Test the Thermometer controller wrapping playground-io Thermometer */
import Playground from 'playground-io';
import sinon from 'sinon';

import Thermometer from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/Thermometer';



describe('Thermometer', function () {
  let testObj;

  beforeEach(() => {
    sinon.stub(Playground.Thermometer.initialize, 'value');
    testObj = {};
  });

  afterEach(() => {
    Playground.Thermometer.initialize.value.restore();
  });

  it(`adds 'raw' and 'value' attributes in the initialize() method`, () => {
    expect(testObj).to.not.haveOwnProperty('raw');
    expect(testObj).to.not.haveOwnProperty('value');

    // These tests are a little odd because Thermometer is sort of a 'controller
    // template' consumed by Johnny-Five - thus we test individual methods by
    // calling them with a particular 'this'.
    Thermometer.initialize.value.call(testObj);
    expect(testObj).to.haveOwnProperty('raw');
    expect(testObj).to.haveOwnProperty('value');

    // Check that call passes through to 'parent' controller, too.
    expect(Playground.Thermometer.initialize.value).toHaveBeenCalledTimes(1);
  });

  it(`'raw' and 'value' attributes are readonly`, () => {
    Thermometer.initialize.value.call(testObj);

    const rawDesc = Object.getOwnPropertyDescriptor(testObj, 'raw');
    expect(rawDesc.set).toBeUndefined();

    const valueDesc = Object.getOwnPropertyDescriptor(testObj, 'value');
    expect(valueDesc.set).toBeUndefined();
  });

  it(`value is still translated to celsius`, () => {
    Thermometer.initialize.value.call(testObj);
    expect(Thermometer.toCelsius.value.call(testObj, 0)).toBe(-273);
    expect(Thermometer.toCelsius.value.call(testObj, 1)).toBe(-77);
    expect(Thermometer.toCelsius.value.call(testObj, 15)).toBe(-47);
    expect(Thermometer.toCelsius.value.call(testObj, 230)).toBe(0);
    expect(Thermometer.toCelsius.value.call(testObj, 512)).toBe(25);
    expect(Thermometer.toCelsius.value.call(testObj, 1022)).toBe(352);
    expect(Thermometer.toCelsius.value.call(testObj, 1023)).toBe(-273); // ?
  });

  it(`raw sensor value passed to 'toCelsius' becomes new 'raw' and 'value' value`, () => {
    Thermometer.initialize.value.call(testObj);
    for (let i = 0; i < 1024; i++) {
      Thermometer.toCelsius.value.call(testObj, i);
      expect(testObj.raw).to.equal(testObj.value).toBe(i);
    }
  });
});
