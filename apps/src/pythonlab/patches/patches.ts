export const MATPLOTLIB_IMG_TAG = 'MATPLOTLIB_SHOW_IMG';

export const PATCH_MATPLOTLIB = `
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

export const FLUSH_STDOUT = `import sys
import os

sys.stdout.flush()
os.fsync(sys.stdout.fileno())
`;
