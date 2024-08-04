# Configures python to work via pycall.
#
# This file must be loaded before application.rb automatically loads all gems
# in the Gemfile so that the PYTHON environment variable is set correctly.
# Otherwise various pycall related gems like numpy will fail to load.

ENV['PYTHON'] = `pdm run which python`.strip
unless File.exist? ENV['PYTHON']
  raise "Python bin not found at #{ENV['PYTHON']}. Please run `pdm install` again."
end

# pycall.rb is following symlinks from the virtualenv, and finding the underlying
# interpreter directory, which means its missing the site-packages directory for
# our virtualenv. As a result, we specify it manually.
ENV['PYTHONPATH'] = `pdm run python -c "import site; print(site.getsitepackages()[0])"`.strip

# Put `pyimport` and `pyfrom` methods in the global namespace.
require 'pycall/import'
include PyCall::Import
