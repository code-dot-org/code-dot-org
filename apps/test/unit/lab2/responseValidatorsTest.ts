import {LevelPropertiesMapValidator} from '@cdo/apps/lab2/responseValidators';

describe('LevelPropertiesMapValidator', () => {
  it('throws an error if the response is an array', () => {
    expect(() => {
      LevelPropertiesMapValidator([]);
    }).toThrow('Level properties map should be an object (received array).');
  });

  it('throws an error if a level properties is not an object', () => {
    expect(() => {
      LevelPropertiesMapValidator({
        '10001': 'invalid',
      });
    }).toThrow('Level properties should be an object (received string).');
  });

  it('throws an error if any level properties is an array', () => {
    expect(() => {
      LevelPropertiesMapValidator({
        '10001': [],
      });
    }).toThrow('Level properties should be an object (received array).');
  });

  it('throws an error if appName is missing from any level properties', () => {
    expect(() => {
      LevelPropertiesMapValidator({
        '10001': {
          otherField: 'value',
        },
      });
    }).toThrow('Missing required field: appName');
  });

  it('converts stringified booleans to actual booleans', () => {
    const levelId = '10001';
    const result = LevelPropertiesMapValidator({
      [levelId]: {
        appName: 'pythonlab',
        isProjectLevel: 'true',
        hideShareAndRemix: 'false',
      },
    });
    expect(result[levelId].isProjectLevel).toBe(true);
    expect(result[levelId].hideShareAndRemix).toBe(false);
  });

  it('returns the validated LevelPropertiesMap', () => {
    const levelId1 = '10001';
    const levelId2 = '10002';
    const result = LevelPropertiesMapValidator({
      [levelId1]: {
        appName: 'pythonlab',
        isProjectLevel: 'true',
        hideShareAndRemix: 'false',
      },
      [levelId2]: {
        appName: 'music',
        showRubric: 'true',
        levelData: {library: 'launch2024'},
      },
    });
    expect(result).toEqual({
      [levelId1]: {
        appName: 'pythonlab',
        isProjectLevel: true,
        hideShareAndRemix: false,
      },
      [levelId2]: {
        appName: 'music',
        showRubric: true,
        levelData: {library: 'launch2024'},
      },
    });
  });
});
