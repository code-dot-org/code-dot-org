# Python in the code-dot-org monorepo

While our monorepo is predominantly geared toward Ruby on Rails, we have the ability to
run Python code from Rails. This is enabled by [pycall.rb](https://github.com/mrkn/pycall.rb),
and allows us to take advantage of Python's great package ecosystem. More information is available
in [the initial pycall PR](https://github.com/code-dot-org/code-dot-org/pull/60048).

For package management and virtual env we use [uv](https://docs.astral.sh/uv/), see
[section on using uv below](#uv-manage-python-packages-and-virtualenv).

### PyCall (currently) doesn't work from Rails web requests

While we hope to fix this in the future, PyCall is not thread-safe, and cannot be invoked from
Rails web requests. Invoking PyCall from a Rails controller request will cause
an instant SEGV crash of the Rails process.

This means, at present, **PyCall should be used from ActiveJob workers**.

- On production we are using `delayed_job` for ActiveJob, which does not use threads.
- On development, we default to the async adapter, which uses threads. If you wish to develop
  ActiveJob Python workers, you'll need to set `active_job_queue_adapter: delayed_job }` in
  your locals.yml and launch workers manually using `bundle exec bin/delayed_job start`.
  See comments in [locals.yml.default](../locals.yml.default) for more details.

## uv: manage python packages and virtualenv

[uv](https://docs.astral.sh/uv/) uses [pyproject.toml](../pyproject.toml) to create a python virtualenv, and install and manage its
dependencies. Its similar to `bundle` from the Ruby world, or `yarn`/`npm` from the Node world,
and includes many of the same features.

Common commands:

- `uv sync`: install dependencies specified in pyproject.toml. like: `yarn install` or `bundle install`
- `uv add boto9000`: add boto9000 to pyproject.toml and install it. like: `yarn install boto9000`
- `uv run ____`: run `____` inside the repo's python virtualenv. like: `bundle exec ____`
  - example: `uv run ipython`: start ipython
  - example: `uv run pytest`: run pytest in the current dir
- `source .venv/bin/activate`: activate the python virtual environment created by uv (see `uv venv activate` for exact command)

## pycall.rb: how to invoke python code from rails

- Ruby => Python function calls are very fast: microseconds not milliseconds
- Ruby callbacks can be passed into Python functions
- Python packages, specified in sub-packages like `/python/pycdo/pyproject.toml`, can be imported in Ruby using `pyimport('pipname')`
- Python code can be added to pycdo, e.g. /python/pycdo/mynewfeature.py, or by creating a new toplevel package like /python/myfeature. See [how to structure your python code](#how-to-structure-your-python-code).

### Examples of calling python from ruby

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

Importing `/python/pycdo/pycdo/test_module/test_func.py` in ruby:

```
pyfrom 'pycdo.test_module`, import: :test_func
puts test_func()
# => "Ruby can call Python1"
```

Accessing python's builtin methods like `dir()` and `help()`:

```
pyfrom :builtins, import: [:dir, :help]
help(math)
dir(math)
```

## How to structure your python code

You have two basic options:

1. If you're only adding a small snippet of python code, [add a new module to the pycdo package](#add-a-new-module-to-the-pycdo-package).
1. If you're building a larger python-using feature, [add a new python package](#add-a-new-python-package):

Once you've added your python code either of these two ways, you can call it from Ruby tests, or from Rails models and controller methods.

### Add a new module to the pycdo package

Adding a new file or module to the [pycdo](./pycdo) package is a great way to support smaller features that
will only be one or a few files of python.

1. Create a python file for your snippet, e.g. in `/python/pycdo/myfeature.py` create a python function with a simple method:
   ```
   def testmefunc():
     print("testme() called")
     return "testme"
   ```
1. Now try your code from ruby `bin/dashboard-console`:
   ```
   pyfrom 'pycdo', import: :myfeature
   myfeature.testmefunc()
   ```

We showed adding a single-file module, but you can of course
also create a new sub-directory like `/python/pycdo/myfeature/__init__.py`.

### Add a new python package

Creating a new python package under `/python` is a great way to add larger features. This will
permit you to specify your own dependencies, and have your own test setup. You'll be able to
test and run your package in its own virtualenv, as well as in the repo-wide virtualenv.

1. Create a new sub-dir under /python for your package, e.g. /python/myfeature
1. Create a /python/newfeature/pyproject.toml for your package

   - See [pycdo's pyproject.toml](./pycdo/pyproject.toml) for an example

1. Create a module sub-directory inside your package: `/python/myfeature/myfeature`

   - this should usually be the same name as your package, e.g. myfeature
   - add an `__init__.py` with a simple method defined in it, e.g.:
     ```
       def testmefunc():
         print("testme() called")
         return "testme"
     ```

1. Try out your module from inside it's directory (e.g. from /python/myfeature) run:
   1. `uv sync`: this will switch the current venv to include myfeature's dependencies
   1. `uv run python`
      1. `import myfeature`
      1. `myfeature.testmefunc()`
1. Modify the toplevel [/pyproject.toml](../pyproject.toml)'s dependencies section to point to your new package:

   ```
   dependencies = [
    "myfeature",
   ...
   [tool.uv.sources]
   myfeature = { workspace = true }
   ...
   [tool.uv.workspace]
   members = [
      'python/myfeature',
   ```

1. Now try out your package from the project repo directory (i.e. from code-dot-org/) run:
1. `uv sync`
1. `uv run python3 -c 'import myfeature; print(myfeature.testmefunc)'`
1. Now you're ready to try our code from Ruby:
1. `bin/dashboard-console`:
   ```
   pyimport 'myfeature'
   myfeature.testmefunc()
   ```

**NOTE: when adding python dependencies, please prefer '>=' version matches** to '==' matches. The lockfile will ensure that
version numbers are kept constant, and using '>=' will make it much easier to do package version upgrades
repo-wide.

#### Testing python packages

Python packages should be testable by running `uv run pytest` from the package's main directory.

Most likely you want to configure your project to use pytest on the tests/ sub-dir by configuring pyproject.toml like:
```
[tool.pytest.ini_options]
testpaths = ['tests']
```


Our CI system will automatically run `uv run pytest` against every directory that contains a pyproject.toml.

#### Linting python packages

All .py files in python/ will be automatically linted using Ruff, both at commit and in CI.