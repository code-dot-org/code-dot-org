# Configures python to work via pycall.
#
# This file must be loaded before application.rb automatically loads all gems
# in the Gemfile so that the PYTHON environment variable is set correctly.
# Otherwise various pycall related gems like numpy will fail to load.

require 'cdo/python_venv'
require 'pycall_thread'

PyCallThread.init do
  ENV['PYTHON'] = PythonVenv.python_bin_path
  unless File.exist? ENV['PYTHON']
    raise "Python bin not found at #{ENV['PYTHON']}. Please run `pdm install` again."
  end

  require 'pycall'

  # Put `pyimport` and `pyfrom` methods in the global namespace.
  require 'pycall/import'
  include PyCall::Import

  # Python initializes its site-packages directory using site.py:
  # https://github.com/python/cpython/blob/main/Lib/site.py
  # Which looks for pyenv.cfg relative to sys.executable, and uses that to properly
  # initialize the site-packages directory. Because pycall.rb uses libpython,
  # sys.executable is set to the ruby interpreter, and site.py doesn't properly
  # add site-packages for our venv to the sys.path. So, we do it manually:
  pyimport 'site'
  site.addsitedir(PythonVenv.site_packages_path)

  # Now unset PYTHON & PYTHONHOME so we don't mess up python3-using apps
  # launched from our Ruby processes (like the aws cli)
  # see: https://github.com/code-dot-org/code-dot-org/pull/60048#issuecomment-2267510208
  pyimport 'sys' # ensure libpython is already loaded before unsetting env vars
  ENV.delete('PYTHONHOME')
  ENV.delete('PYTHON')
end
