import {
  LevelPropertiesMapValidator,
  sourceResponseValidatorFor,
} from '@cdo/apps/lab2/responseValidators';

describe('sourceResponseValidatorFor', () => {
  const multiFile = {source: {folders: {}, files: {}}};
  const stringified = {source: JSON.stringify({blocks: {}})};

  it('rejects a stringified source for a Codebridge lab', () => {
    expect(() => sourceResponseValidatorFor('weblab2')(stringified)).toThrow(
      'Codebridge sources must be a JSON object'
    );
    expect(sourceResponseValidatorFor('pythonlab')(multiFile)).toBe(multiFile);
  });

  it('accepts a stringified source with blocks for a Blockly lab', () => {
    expect(sourceResponseValidatorFor('music')(stringified)).toBe(stringified);
    expect(() =>
      sourceResponseValidatorFor('music')({source: JSON.stringify({})})
    ).toThrow('Missing required field: blocks');
  });

  it('checks only that a source exists for other labs and for no lab', () => {
    expect(sourceResponseValidatorFor('adaptive')(stringified)).toBe(
      stringified
    );
    expect(sourceResponseValidatorFor(null)(multiFile)).toBe(multiFile);
    expect(() => sourceResponseValidatorFor(undefined)({})).toThrow(
      'Missing required field: source'
    );
  });
});

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
