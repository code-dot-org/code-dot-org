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
    // Each unique sound gets its own row (and therefore color).
    // If a sound was showing previously, then we'll attempt to keep
    // it in the same row, though we won't have empty rows.

    // First, generate a list of all current unique sounds.
    const currentUniqueSounds = [];
    for (const songEvent of songDataEvents) {
      const id = songEvent.id;
      if (currentUniqueSounds.indexOf(id) === -1) {
        currentUniqueSounds.push(id);
      }
    }

    // This will eventually be the function output.
    let arrangedSounds;

    // If we have a previous output from this function, then we'll attempt
    // to keep those entries in the same rows as they were before.
    if (this.previousUniqueSounds) {
      // This is where we will store the output sounds.  It can be a sparse
      // array.
      const outputSounds = [];

      // For each of those previous entries...
      for (let i = 0; i < this.previousUniqueSounds.length; i++) {
        // ...if it's still in use...
        if (currentUniqueSounds.indexOf(this.previousUniqueSounds[i]) !== -1) {
          // ... put it back in that row.
          outputSounds[i] = this.previousUniqueSounds[i];
        }
      }

      // For each of our known current sounds...
      for (let j = 0; j < currentUniqueSounds.length; j++) {
        // ... if it's not yet in a row...
        if (outputSounds.indexOf(currentUniqueSounds[j]) === -1) {
          // ...then put it in the first row available.
          const availableRowIndex = outputSounds.findIndex(
            x => typeof x === 'undefined'
          );
          // If no empty rows are available, then put the sound at the end.
          const row =
            availableRowIndex === -1 ? outputSounds.length : availableRowIndex;

          outputSounds[row] = currentUniqueSounds[j];

          // (One scenario where this helps is when a sound is renamed.
          // The new  entry will replace the old one in the same row.)
        }
      }

      // Remove any empty rows.
      arrangedSounds = outputSounds.filter(s => {
        return typeof s !== 'undefined';
      });
    } else {
      arrangedSounds = currentUniqueSounds;
    }

    // Remember this set for next time.
    this.previousUniqueSounds = arrangedSounds;

    return arrangedSounds;
  }
}
