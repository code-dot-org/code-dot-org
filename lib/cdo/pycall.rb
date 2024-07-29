# Configures python to work via pycall.

# This file must be loaded before application.rb automatically loads all gems
# in the Gemfile so that the PYTHON environment variable is set correctly.
# Otherwise various pycall related gems like numpy will fail to load.

def pipenv_venv_path
  unless system("which pipenv > /dev/null 2>&1")
    raise 'pipenv not found. Please install pipenv and try again, see SETUP.md.'
  end

  stdout, stderr, status = Open3.capture3('pipenv --venv')
  raise "Failed to get virtual environment path from pipenv, try `pipenv install`? Error: #{stderr}" unless status.success?
  stdout.strip
end

venv_path = pipenv_venv_path

ENV['PYTHON'] = "#{venv_path}/bin/python"
ENV['PYTHONPATH'] = "#{venv_path}/lib/python3.8/site-packages"

unless File.exist? ENV['PYTHON']
  raise "Python bin not found at #{ENV['PYTHON']}. Please run `pipenv install` again."
end

require 'pycall'
