export const MATPLOTLIB_IMG_TAG = 'MATPLOTLIB_SHOW_IMG';

// This allows us to use matplotlib in the webworker version of pyodide.
// It patches show to save the image to a base64 string and print it along with
// a tag indicating it is a matplotlib image. It's a bit fragile, as a user could
// either overwrite the matplotlib backend and ignore the patch, or use the same tag
// elsewhere for confusing results.
// This patch is always prepended to the user's code.
// Adapted from https://github.com/pyodide/matplotlib-pyodide/issues/6#issuecomment-1242747625
const PATCH_MATPLOTLIB = `
import base64
import os

from io import BytesIO

os.environ['MPLBACKEND'] = 'AGG'

import matplotlib.pyplot

def ensure_matplotlib_patch():
    _old_show = matplotlib.pyplot.show

    def show():
        buf = BytesIO()
        matplotlib.pyplot.savefig(buf, format='png')
        buf.seek(0)
        # encode to a base64 str
        img = base64.b64encode(buf.read()).decode('utf-8')
        print('${MATPLOTLIB_IMG_TAG} % s' % img)
        matplotlib.pyplot.clf()

    matplotlib.pyplot.show = show

ensure_matplotlib_patch()
`;

// Ensure stdout is flushed at the end of the user's program
// so all of their prints show up. This patch is always appended to the end of the user's code.
const FLUSH_STDOUT = `import sys
import os

sys.stdout.flush()
os.fsync(sys.stdout.fileno())
`;

// TODO: Should we always patch matplotlib? Or can we be smarter about when to patch it?
// (patching it requires importing it, which can be slow).
// Ticket: https://codedotorg.atlassian.net/browse/CT-475
export const ALL_PATCHES = [
  {contents: PATCH_MATPLOTLIB, shouldPrepend: true},
  {contents: FLUSH_STDOUT, shouldPrepend: false},
];
