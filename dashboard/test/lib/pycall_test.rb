require 'test_helper'
require 'pycall'

class PyCallTest < ActiveSupport::TestCase
  test 'pyimport a module from pycdo' do
    # From /python/pycdo/test_module/example_func.py
    pyfrom 'pycdo.test_module', import: :example_func
    assert_equal 'Ruby can call Python!', example_func
  end

  test 'pyimport a package dep from /python/pycdo/pyproject.toml' do
    pyimport 'openai'
    assert_equal 'openai', openai.__name__
  end

  test 'pyimport and pyfrom' do
    pyimport 'math'
    assert_equal 5.0, math.sqrt(25)

    pyfrom 'math', import: :sqrt
    assert_equal 5.0, sqrt(25)

    pyimport 'math', as: 'numberstuff'
    assert_equal 5.0, numberstuff.sqrt(25)
  end

  test 'PyCall.exec' do
    # Note you shouldn't use PyCall.exec like this, because now `py_run_callback`
    # pollutes the global namespace in python.

    # Define a python function inside a string:
    PyCall.exec <<~PYTHON
      def py_do_thing():
        return 5
    PYTHON

    # Get a reference to the python function
    py_do_thing = PyCall.eval('py_do_thing')

    # Call the function
    assert_equal 5, py_do_thing.call
  end

  test 'PyCall.import_module' do
    math = PyCall.import_module('math')
    assert_equal 1.0, math.sin(math.pi / 2)
  end
end
