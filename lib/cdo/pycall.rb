# Configures python to work via pycall.

pybin_path = File.expand_path('../../../pybin', __FILE__)
pybin_bin_path = "#{pybin_path}/bin"
ENV['PATH'] = "#{pybin_bin_path}:#{ENV['PATH']}" unless ENV['PATH'].include? pybin_bin_path
ENV['PYTHON'] = "#{pybin_bin_path}/python3.8"

which_python = `which python3.8`.strip
unless which_python == ENV['PYTHON']
  raise "python3.8 not found at #{ENV['PYTHON'].inspect} (was #{which_python.inspect}). Please run bin/setup_python_venv.sh or rake build and try again."
end

require 'pycall'
PyCall.sys.path.append("#{pybin_path}/lib/python3.8/site-packages")
