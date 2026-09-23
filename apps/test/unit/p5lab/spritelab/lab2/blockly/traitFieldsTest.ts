import {withCurrentValue} from '@cdo/apps/p5lab/spritelab/lab2/blockly/traitFields';

describe('withCurrentValue', () => {
  const options: [string, string][] = [
    ['Leaf Spots', 'LeafSpots'],
    ['Soil Moisture', 'SoilMoisture'],
  ];

  it('leaves the options alone when they hold the value', () => {
    expect(withCurrentValue(options, 'LeafSpots')).toBe(options);
  });

  it('keeps a saved value the model list has not delivered yet', () => {
    expect(withCurrentValue([['no model imported', '']], 'LeafSpots')).toEqual([
      ['LeafSpots', 'LeafSpots'],
    ]);
  });

  it('adds nothing for an empty value', () => {
    expect(withCurrentValue(options, '')).toBe(options);
  });
});
