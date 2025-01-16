from .patch_matplotlib import patch_matplotlib
from .reset_neighborhood import reset_neighborhood

def setup_pythonlab(matplotlib_img_tag):
  patch_matplotlib(matplotlib_img_tag)
  reset_neighborhood()
