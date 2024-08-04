# Configures python to work via pycall.
#
# This file must be loaded before application.rb automatically loads all gems
# in the Gemfile so that the PYTHON environment variable is set correctly.
# Otherwise various pycall related gems like numpy will fail to load.

require 'cdo/python_venv'

ENV['PYTHON'] = PythonVenv.python_bin_path
unless File.exist? ENV['PYTHON']
  raise "Python bin not found at #{ENV['PYTHON']}. Please run `pdm install` again."
end

# pycall.rb is following symlinks from the virtualenv, and finding the underlying
# interpreter directory, which means its missing the site-packages directory for
# our virtualenv. As a result, we specify it manually.
ENV['PYTHONPATH'] = PythonVenv.site_packages_path

require 'pycall'

# Put `pyimport` and `pyfrom` methods in the global namespace.
require 'pycall/import'
include PyCall::Import

# Do an import to ensure the Python interpreter is initialized.
pyimport 'pycdo'

# Now unset the PYTHONPATH & PYTHONHOME so we don't mess up python3-using apps
# launched from our Ruby processes (like the aws cli)
# see: https://github.com/code-dot-org/code-dot-org/pull/60048#issuecomment-2267510208
ENV.delete('PYTHONPATH')
ENV.delete('PYTHONHOME')
