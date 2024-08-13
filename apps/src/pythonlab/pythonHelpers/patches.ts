export const MATPLOTLIB_IMG_TAG = 'MATPLOTLIB_SHOW_IMG';

// Ensure stdout is flushed at the end of the user's program
// so all of their prints show up. This patch is always appended to the end of the user's code.
export const FLUSH_STDOUT = `import sys
import os

sys.stdout.flush()
os.fsync(sys.stdout.fileno())
`;

// TODO: Should we always patch matplotlib? Or can we be smarter about when to patch it?
// (patching it requires importing it, which can be slow).
// Ticket: https://codedotorg.atlassian.net/browse/CT-475
export const SETUP_CODE = `from pythonlab_setup import setup_pythonlab
setup_pythonlab('${MATPLOTLIB_IMG_TAG}')
`;
