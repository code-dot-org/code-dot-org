import setWeather, {
  SET_WEATHER_OPTIONS,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/setWeather';
import {WEATHER_KINDS} from '@cdo/apps/p5lab/spritelab/lab2/weather';

describe('spritelab2_setWeather', () => {
  it('offers every weather kind, none first, as its own value', () => {
    expect(SET_WEATHER_OPTIONS.map(([label]) => label)).toEqual([
      ...WEATHER_KINDS,
    ]);
    expect(SET_WEATHER_OPTIONS[0][0]).toBe('none');
    SET_WEATHER_OPTIONS.forEach(([label, value]) => expect(value).toBe(label));
  });

  it('generates a setWeather call with the chosen kind', () => {
    const block = {getFieldValue: () => 'rain'};
    expect(setWeather.generator(block as never, {} as never)).toBe(
      'setWeather("rain");\n'
    );
  });
});
