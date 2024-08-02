include_recipe 'cdo-python::pyenv'
include_recipe 'cdo-python::pipenv'

# Note: python itself will be installed by pipenv+pyenv during `rake build`
# according to the Python version specified in the Pipfile
