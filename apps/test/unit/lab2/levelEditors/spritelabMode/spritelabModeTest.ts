import {
  cleanLevelMode,
  fieldApplies,
  parsePaletteRoles,
  setImageFirst,
  setImageRole,
  setImageType,
  setKind,
  setOneImage,
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
      limitedPaintTools: true,
      imageKinds: ['sprite', 'block'],
      generationLimit: 5,
      worldSizes: true,
    };
    expect(cleanLevelMode(mode)).toEqual({mode, removed: []});
  });

  it('drops a generation limit that is not a whole number above zero', () => {
    [0, -1, 2.5, '5', true].forEach(generationLimit =>
      expect(cleanLevelMode({kind: 'code', generationLimit}).mode).toEqual({
        kind: 'code',
      })
    );
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

  it('keeps the one-image flag', () => {
    expect(cleanLevelMode({kind: 'image', oneImage: true}).mode).toEqual({
      kind: 'image',
      oneImage: true,
    });
  });

  // The form hides the checkbox on a free play level, so a flag kept here
  // could never be cleared, and the hidden input would submit it again.
  it('drops a key the kind cannot carry, rather than round-tripping it', () => {
    const {mode, removed} = cleanLevelMode({
      kind: 'freeplay',
      oneImage: true,
      imageType: 'sprite',
      learning: true,
    });
    expect(mode).toEqual({kind: 'freeplay', learning: true});
    expect(removed).toEqual(['oneImage: true', 'imageType: "sprite"']);
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

  it('offers one image wherever there is an Images tab, except free play', () => {
    expect(fieldApplies({kind: 'image'}, 'oneImage')).toBe(true);
    expect(fieldApplies({kind: 'code', imageFirst: true}, 'oneImage')).toBe(
      true
    );
    expect(fieldApplies({kind: 'code'}, 'oneImage')).toBe(false);
    expect(fieldApplies({kind: 'freeplay'}, 'oneImage')).toBe(false);
    // Free play offers the other Images tab fields.
    expect(fieldApplies({kind: 'freeplay'}, 'learning')).toBe(true);
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
  it("keeps the Images tab's options on an image level", () => {
    const options = {
      limitedPaintTools: true,
      noNewImages: true,
      noDeletingImages: true,
    };
    expect(
      setImageType({kind: 'image', imageType: 'sprite', ...options}, 'block')
    ).toEqual({kind: 'image', imageType: 'block', ...options});
  });

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

  it('drops one image along with the Images tab it needs', () => {
    expect(
      setImageFirst({kind: 'play', imageFirst: true, oneImage: true}, false)
    ).toEqual({kind: 'play'});
  });
});

describe('setOneImage', () => {
  it('removes the key rather than storing false', () => {
    expect(setOneImage({kind: 'image', oneImage: true}, false)).toEqual({
      kind: 'image',
    });
    expect(setOneImage({kind: 'image'}, true)).toEqual({
      kind: 'image',
      oneImage: true,
    });
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
