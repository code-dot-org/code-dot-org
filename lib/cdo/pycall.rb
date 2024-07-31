# Configures python to work via pycall.

require 'open3'

# This file must be loaded before application.rb automatically loads all gems
# in the Gemfile so that the PYTHON environment variable is set correctly.
# Otherwise various pycall related gems like numpy will fail to load.

# This should only be the MAJOR.MINOR, but should otherwise match `python_version` in the Pipfile.
PYTHON_VERSION = "3.12"

def get_pipenv_venv_path
  if `which pipenv` == ''
    raise 'Tried `which pipenv`: pipenv not found. Please install pipenv and try again, see SETUP.md.'
  end

  env = {
    # Ensure `pipenv` still works when run from deeply nested directories, required for
    # tests which invoke DashboardHelpers::require_rails_env from dashboard/test/ui.
    'PIPENV_MAX_DEPTH' => '5',
  }
  stdout, stderr, status = Open3.capture3(env, 'pipenv --venv')
  unless status.success?
    raise "Failed to get virtual environment path from pipenv, try `pipenv install`? Error: #{stderr}"
  end
  stdout.strip
end

venv_path = get_pipenv_venv_path

# Use the python interpreter from the pipenv virtualenv
ENV['PYTHON'] = "#{venv_path}/bin/python"

# pycall.rb is following symlinks from the virtualenv, and finding the underlying
# interpreter directory, which means its missing the site-packages directory for
# our virtualenv. As a result, we specify it manually.
ENV['PYTHONPATH'] = "#{venv_path}/lib/python#{PYTHON_VERSION}/site-packages"

unless File.exist? ENV['PYTHON']
  raise "Python bin not found at #{ENV['PYTHON']}. Please run `pipenv install` again."
end

require 'pycall'
