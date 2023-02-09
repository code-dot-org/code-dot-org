// This module will hold some references to values that are currently
// stored in React state (in MusicView), so that non-React code related
// to Blockly blocks can access them.
//
// Longer term, we would like to hoist this "global" app state out of
// our React code, allowing our React code to return to being just a
// "view", and so that non-React code can also work more naturally with
// this data.

let libraryRef = null;
let playerRef = null;
let programSequencerRef = null;

export default {
  setLibrary(library) {
    libraryRef = library;
  },

  getLibrary() {
    return libraryRef;
  },

  setPlayer(player) {
    playerRef = player;
  },

  getPlayer() {
    return playerRef;
  },

  setProgramSequencer(programSequencer) {
    programSequencerRef = programSequencer;
  },

  getProgramSequencer() {
    return programSequencerRef;
  }
};
