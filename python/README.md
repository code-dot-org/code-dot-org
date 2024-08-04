# Python in the code-dot-org monorepo

While our monorepo is predominantly geared toward Ruby on Rails, we have the ability to
run Python code from Rails. This is enabled by [pycall.rb](https://github.com/mrkn/pycall.rb),
and allows us to take advantage of Python's great package ecosystem. More information is available
in [the initial pycall PR](https://github.com/code-dot-org/code-dot-org/pull/60048).

For package management and virtual env we use [pdm](https://pdm-project.org/), see below.

## [pdm](https://pdm-project.org/): manage python packages and virtual env

pdm uses [pyproject.toml](../pyproject.toml) to create a python virtualenv, and install and manage its
dependencies. Its similar to `bundle` from the Ruby world, or `yarn`/`npm` from the Node world,
and includes many of the same features.

Basics:

- `pdm install`: install dependencies specified in `pyproject.toml`. like: `yarn install` or `bundle install`
- `pdm add boto9000`: add boto9000 to `pyproject.toml` and install it. like: `yarn install boto9000`
- `pdm run ____`: run `____` inside the repo's python virtualenv. like: `bundle exec ____`
  - example: `pdm run ipython`: start ipython
  - example: `pdm run pytest`: run pytest in the current dir
- `source .venv/bin/activate`: activate the python virtual environment created by pdm (see `pdm venv activate` for exact command)

## pycall.rb: how to invoke python code from rails

- Ruby => Python function calls are very fast: microseconds not milliseconds
- Ruby callbacks can be passed into Python functions
- Python packages, specified in `/Pipfile`, can be imported in Ruby using `PyCall.import('pipname')`

### Examples

Importing a python module and calling it:

```
pyimport 'math'
puts "Python says the square root of 25 is: #{math.sqrt(25)}"

pyfrom 'math', import: :sqrt
puts "Python says the square root of 100 is: #{sqrt(100)}"

pyimport 'math', as: :numberstuff
puts "Python says the square root of 9 is: #{numberstuff.sqrt(9)}

# or to use a lower-level method, you could do:
yo = PyCall.import_module 'math'
puts "Python says the square root of 16 is: #{yo.sqrt(16)}
```

Accessing python's builtin methods like `dir()` and `help()`:

```
pyfrom :builtins, import: [:dir, :help]
help(math)
dir(math)
```

Passing ruby callbacks to python:

```

ruby_callback = lambda do |arg|
"ruby_callback('#{arg}') was invoked"
end

PyCall.exec <<~PYTHON
  def py_run_callback(cb):
    return "Python says: " + cb("hi from py")
PYTHON

py_run_callback = PyCall.eval('py_run_callback')
response = py_run_callback.call(ruby_callback)

puts "Ruby says: #{response}"

# => Ruby says: Python says: ruby_callback('hi from py') was invoked

```
