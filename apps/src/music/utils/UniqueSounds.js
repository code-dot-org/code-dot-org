export default class UniqueSounds {
  constructor() {
    this.previousUniqueSounds = null;
  }

  // Given some song data events, this function returns an array of the
  // sound IDs in the order that we want to render them in the timeline UI.
  // If available, it uses its own previous return value to ensure that
  // sounds remain in the same row as last time.
  //
  // It does remove empty rows, so if a sound is removed, then everything
  // can shift up.
  //
  // If a sound is replaced in subsequent calls, which will happen when a
  // block has its sound changed in the dropdown, then the stickiness of
  // all other sounds means that the new sound will replace the old one in
  // the same row.

  getUniqueSounds(songDataEvents) {
    // First, generate a list of all current unique sounds.
    const currentUniqueSounds = [];
    for (const songEvent of songDataEvents) {
      const id = songEvent.id;
      if (currentUniqueSounds.indexOf(id) === -1) {
        currentUniqueSounds.push(id);
      }
    }

    // This will eventually be the function output.
    let resultSounds;

    // If we have a previous output from this function, then we'll attempt
    // to keep its sounds in the same rows as they were before.
    if (this.previousUniqueSounds) {
      // This is where we will store the output sounds.  It can be a sparse
      // array since it will maintain existing sound positions if they
      // were already positioned previously.
      const outputSounds = [];

      // This is an array of new sounds that we haven't seen previously.
      const newSounds = [];

      // For each current sound, either add it to outputSounds in its
      // previous position, or track it in newSounds.
      for (let currentUniqueSound of currentUniqueSounds) {
        const previousIndex =
          this.previousUniqueSounds.indexOf(currentUniqueSound);
        if (previousIndex !== -1) {
          outputSounds[previousIndex] = currentUniqueSound;
        } else {
          newSounds.push(currentUniqueSound);
        }
      }

      // For each new sound, add it to the first empty position available,
      // or otherwise put it at the end.  (One scenario where this helps
      // is when a sound is renamed; the new entry will replace the old one
      // in the same position.)
      for (let newSound of newSounds) {
        const availableRowIndex = outputSounds.findIndex(
          x => typeof x === 'undefined'
        );
        const row =
          availableRowIndex === -1 ? outputSounds.length : availableRowIndex;
        outputSounds[row] = newSound;
      }

      // Remove any empty rows.
      resultSounds = outputSounds.filter(s => {
        return typeof s !== 'undefined';
      });
    } else {
      resultSounds = currentUniqueSounds;
    }

    // Remember this result for next time.
    this.previousUniqueSounds = resultSounds;

    return resultSounds;
  }
}
