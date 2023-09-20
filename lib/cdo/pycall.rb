# Configures python to work via pycall.

# This file must be loaded before application.rb automatically loads all gems
# in the Gemfile, for two reasons:
# 1. python must be configured before pycall is loaded
# 2. on Mac OS, PyCall.sys.path must be configured after pycall is loaded but
#    before any other python-related gems are loaded, such as numpy

pybin_path = File.expand_path('../../../pybin', __FILE__)
pybin_bin_path = "#{pybin_path}/bin"
ENV['PATH'] = "#{pybin_bin_path}:#{ENV['PATH']}" unless ENV['PATH'].split(':').include? pybin_bin_path
ENV['PYTHON'] = "#{pybin_bin_path}/python3.8"

which_python = `which python3.8`.strip
unless which_python == ENV['PYTHON']
  raise "python3.8 not found at #{ENV['PYTHON'].inspect} (was #{which_python.inspect}). Please run bin/setup_python_venv.sh or rake build and try again."
end

require 'pycall'

# Needed for python3.8 on Mac to find any packages in the virtual environment.
PyCall.sys.path.append("#{pybin_path}/lib/python3.8/site-packages")
