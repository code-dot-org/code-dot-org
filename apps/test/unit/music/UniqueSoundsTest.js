/* Tests for music/utils/UniqueSounds.js */

import UniqueSounds from '@cdo/apps/music/utils/UniqueSounds';

describe('Music uniqueSounds tests', function () {
  it('adding one new sound puts it at end', function () {
    const uniqueSounds = new UniqueSounds();

    const songDataEvents1 = [{id: 'sound1'}, {id: 'sound2'}];

    const uniqueSounds1 = uniqueSounds.getUniqueSounds(songDataEvents1);

    const desiredOutput1 = ['sound1', 'sound2'];

    const songDataEvents2 = [{id: 'sound1'}, {id: 'sound3'}, {id: 'sound2'}];

    const uniqueSounds2 = uniqueSounds.getUniqueSounds(songDataEvents2);

    // We want sound1 & sound2 to remain in their places, so even though
    // sound3 is before sound2 in the events, it should end up at the
    // end.
    const desiredOutput2 = ['sound1', 'sound2', 'sound3'];

    expect(uniqueSounds1).toEqual(desiredOutput1);
    expect(uniqueSounds2).toEqual(desiredOutput2);
  });

  it('replacing a sound reuses the old row', function () {
    const uniqueSounds = new UniqueSounds();

    const songDataEvents1 = [{id: 'sound1'}, {id: 'sound2'}, {id: 'sound3'}];

    const uniqueSounds1 = uniqueSounds.getUniqueSounds(songDataEvents1);

    const desiredOutput1 = ['sound1', 'sound2', 'sound3'];

    const songDataEvents2 = [{id: 'sound1'}, {id: 'sound4'}, {id: 'sound3'}];

    const uniqueSounds2 = uniqueSounds.getUniqueSounds(songDataEvents2);

    // We removed sound2 but effectively replaced it with sound4.  We
    // want sound1 and sound3 to remain in place.  So the new sound
    // should replace the old one.
    const desiredOutput2 = ['sound1', 'sound4', 'sound3'];

    expect(uniqueSounds1).toEqual(desiredOutput1);
    expect(uniqueSounds2).toEqual(desiredOutput2);
  });

  it('deleting an early entry shifts later entries up', function () {
    const uniqueSounds = new UniqueSounds();

    const songDataEvents1 = [{id: 'sound1'}, {id: 'sound2'}, {id: 'sound3'}];

    const uniqueSounds1 = uniqueSounds.getUniqueSounds(songDataEvents1);

    const desiredOutput1 = ['sound1', 'sound2', 'sound3'];

    const songDataEvents2 = [{id: 'sound2'}, {id: 'sound3'}];

    const uniqueSounds2 = uniqueSounds.getUniqueSounds(songDataEvents2);

    // We removed sound1 and expect that the later sounds are shifted up.
    const desiredOutput2 = ['sound2', 'sound3'];

    expect(uniqueSounds1).toEqual(desiredOutput1);
    expect(uniqueSounds2).toEqual(desiredOutput2);
  });
});
