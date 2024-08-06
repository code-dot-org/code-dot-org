require 'test_helper'
require 'pycdo/pycdo'

class PyCallTest < ActiveSupport::TestCase
  test 'pyimport a module from pycdo' do
    retval = PyCDO.lock_python_gil do
      # From /python/pycdo/test_module/example_func.py
      pyfrom 'pycdo.test_module', import: :example_func
      example_func
    end
    assert_equal 'Ruby can call Python!', retval
  end

  test 'pyimport a package dep from /python/pycdo/pyproject.toml' do
    retval = PyCDO.lock_python_gil do
      pyimport 'openai'
      openai.__name__
    end
    assert_equal 'openai', retval
  end

  test 'pyimport and pyfrom' do
    retval = PyCDO.lock_python_gil do
      pyimport 'math'
      math.sqrt(25)
    end
    assert_equal 5.0, retval

    retval = PyCDO.lock_python_gil do
      pyfrom 'math', import: :sqrt
      sqrt(25)
    end
    assert_equal 5.0, retval

    retval = PyCDO.lock_python_gil do
      pyimport 'math', as: 'numberstuff'
      numberstuff.sqrt(25)
    end
    assert_equal 5.0, retval
  end

  test 'PyCall.import_module' do
    # DO NOT CALL PyCall directly outside a PyCDO.lock_python_gil block
    # this is only for tests.
    math = PyCall.import_module('math')
    assert_equal 1.0, math.sin(math.pi / 2)
  end
end
