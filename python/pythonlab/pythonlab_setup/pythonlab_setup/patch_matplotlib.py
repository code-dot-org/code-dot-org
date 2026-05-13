import base64
import os

from io import BytesIO

os.environ['MPLBACKEND'] = 'AGG'

import matplotlib.pyplot

# Patch matplotlib.show to print the image as a base64 encoded string.
# This string is prefixed with the given matplotlib_img_tag, so the frontend
# can identify the image and render it correctly.
def patch_matplotlib(matplotlib_img_tag):
    _old_show = matplotlib.pyplot.show

    def show():
        buf = BytesIO()
        matplotlib.pyplot.savefig(buf, format='png')
        buf.seek(0)
        # encode to a base64 str
        img = base64.b64encode(buf.read()).decode('utf-8')
        print(f'{matplotlib_img_tag} {img}')
        matplotlib.pyplot.clf()

    matplotlib.pyplot.show = show
