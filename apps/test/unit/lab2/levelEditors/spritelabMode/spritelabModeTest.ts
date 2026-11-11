import {
  cleanLevelMode,
  fieldApplies,
  parsePaletteRoles,
  setImageFirst,
  setImageRole,
  setImageType,
  setKind,
  setPaletteRoles,
} from '@cdo/apps/lab2/levelEditors/spritelabMode/spritelabMode';

describe('cleanLevelMode', () => {
  it('drops keys the lab does not read', () => {
    const {mode, removed} = cleanLevelMode({
      kind: 'image',
      imageType: 'block',
      sentence: 'block',
      paintInstructions: '**Draw a block.**',
    });
    expect(mode).toEqual({kind: 'image', imageType: 'block'});
    expect(removed).toEqual([
      'sentence: "block"',
      'paintInstructions: "**Draw a block.**"',
    ]);
  });

  it('keeps the options that have no field on the form, when their values are valid', () => {
    const mode = {
      kind: 'code',
      extraTabs: ['Images', 'World'],
      paletteRoles: ['treasure', 'block'],
      noNewImages: true,
      noDeletingImages: true,
      imageKinds: ['sprite', 'block'],
    };
    expect(cleanLevelMode(mode)).toEqual({mode, removed: []});
  });

  it('drops extra tabs and image kinds the lab does not know', () => {
    const {mode, removed} = cleanLevelMode({
      kind: 'code',
      extraTabs: ['Images', 'Sound'],
      imageKinds: ['sprite', 'sprite'],
    });
    expect(mode).toEqual({kind: 'code'});
    expect(removed).toHaveLength(2);
  });

  it('drops everything when the kind is not a real kind', () => {
    const {mode, removed} = cleanLevelMode({
      kind: 'build',
      imageType: 'sprite',
    });
    expect(mode).toEqual({});
    expect(removed).toEqual(['kind: "build"', 'imageType: "sprite"']);
  });

  it('drops a false flag, which reads the same as no flag', () => {
    const {mode, removed} = cleanLevelMode({kind: 'code', imageFirst: false});
    expect(mode).toEqual({kind: 'code'});
    expect(removed).toEqual(['imageFirst: false']);
  });

  it('drops palette roles that are empty or repeated', () => {
    expect(cleanLevelMode({kind: 'world', paletteRoles: []}).mode).toEqual({
      kind: 'world',
    });
    expect(
      cleanLevelMode({kind: 'world', paletteRoles: ['a', 'a']}).mode
    ).toEqual({kind: 'world'});
    expect(
      cleanLevelMode({kind: 'world', paletteRoles: ['a', 'b']}).mode
    ).toEqual({kind: 'world', paletteRoles: ['a', 'b']});
  });
});

describe('fieldApplies', () => {
  it('offers the image type on image and world levels', () => {
    expect(fieldApplies({kind: 'image'}, 'imageType')).toBe(true);
    expect(fieldApplies({kind: 'world'}, 'imageType')).toBe(true);
    expect(fieldApplies({kind: 'code'}, 'imageType')).toBe(false);
  });

  it('offers the image type on any level that opens on Images', () => {
    expect(fieldApplies({kind: 'code', imageFirst: true}, 'imageType')).toBe(
      true
    );
  });

  it('offers only the Images tab fields on a free play level', () => {
    expect(fieldApplies({kind: 'freeplay'}, 'imageType')).toBe(false);
    expect(fieldApplies({kind: 'freeplay'}, 'imageFirst')).toBe(false);
    expect(fieldApplies({kind: 'freeplay'}, 'learning')).toBe(true);
    expect(fieldApplies({kind: 'freeplay'}, 'imageSource')).toBe(true);
  });

  it('offers nothing without a kind', () => {
    expect(fieldApplies({}, 'imageType')).toBe(false);
  });
});

describe('setKind', () => {
  it('keeps keys the new kind can still use', () => {
    expect(
      setKind({kind: 'world', imageType: 'sprite', imageRole: 'hero'}, 'image')
    ).toEqual({kind: 'image', imageType: 'sprite', imageRole: 'hero'});
  });
});

describe('setImageType', () => {
  it('drops the subject when the type is no longer a sprite', () => {
    expect(
      setImageType(
        {kind: 'image', imageType: 'sprite', imageSubject: 'object'},
        'block'
      )
    ).toEqual({kind: 'image', imageType: 'block'});
  });

  it('drops the subject when the type is cleared, keeping the role', () => {
    expect(
      setImageType(
        {
          kind: 'world',
          imageType: 'sprite',
          imageSubject: 'object',
          imageRole: 'hero',
        },
        undefined
      )
    ).toEqual({kind: 'world', imageRole: 'hero'});
  });
});

describe('setImageRole', () => {
  it('trims what is typed', () => {
    expect(setImageRole({kind: 'image'}, ' hero ')).toEqual({
      kind: 'image',
      imageRole: 'hero',
    });
  });
});

describe('setImageFirst', () => {
  it('drops the image fields it was carrying when turned off', () => {
    expect(
      setImageFirst(
        {kind: 'code', imageFirst: true, imageType: 'sprite'},
        false
      )
    ).toEqual({kind: 'code'});
  });
});

describe('parsePaletteRoles', () => {
  it('keeps the order typed and drops blanks and repeats', () => {
    expect(parsePaletteRoles(' treasure , block, , treasure ')).toEqual([
      'treasure',
      'block',
    ]);
  });
});

describe('setPaletteRoles', () => {
  it('removes the key when nothing is left', () => {
    expect(
      setPaletteRoles({kind: 'world', paletteRoles: ['a']}, ' , ')
    ).toEqual({kind: 'world'});
  });
});
