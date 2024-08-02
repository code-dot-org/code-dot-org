# This should match the `python_version` specified in /Pipfile
PYTHON_VERSION = 3.12

# Install pip
apt_package 'python3-pip'

# Install pipenv
execute 'install pipenv' do
  command 'pip install pipenv --prefix=/usr/local'
  not_if 'pip show pipenv'
end

# Install pyenv
include_recipe 'pyenv'

# Install pyenv to /usr/local/pyenv
pyenv_install 'system'

# Use pyenv to build Python==$PYTHON_VERSION into /usr/local/pyenv/versions
# This version of Python should be selected automatically bb pipenv, assuming
# it is compatible with the version of Python specified in the Pipfile.
pyenv_python PYTHON_VERSION
