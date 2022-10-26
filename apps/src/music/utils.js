// This is mostly to separate the 'blockly/media' path from music lab code.
// Potential replacement for existing 'blockly/media' links

// Maps to local directory apps/static
const STATIC_FILE_LOCATION = 'blockly/media';

export const getStaticFilePath = file => `${STATIC_FILE_LOCATION}/${file}`;
