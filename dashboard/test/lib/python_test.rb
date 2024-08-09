require 'test_helper'
require 'python/python'

class PyCallTest < ActiveSupport::TestCase
  test 'Python.run' do
    result = Python.run do
      pyimport 'math'
      math.sqrt(25)
    end
    assert_equal 5, result
  end

  test 'pyimport a module from pycdo' do
    # From /python/pycdo/test_module/example_func.py
    result = Python.run do
      pyfrom 'pycdo.test_module', import: :example_func
      example_func
    end
    assert_equal 'Ruby can call Python!', result
  end

  test 'pyimport a package dep from /python/pycdo/pyproject.toml' do
    result = Python.run do
      pyimport 'openai'
      openai.__name__
    end
    assert_equal 'openai', result
  end

  test 'pyimport and pyfrom' do
    result = Python.run do
      pyimport 'math'
      math.sqrt(25)
    end
    assert_equal 5.0, result

    result = Python.run do
      pyfrom 'math', import: :sqrt
      sqrt(25)
    end
    assert_equal 5.0, result

    result = Python.run do
      pyimport 'math', as: 'numberstuff'
      numberstuff.sqrt(25)
    end
    assert_equal 5.0, result
  end

  test 'PyCall.import_module' do
    result = Python.run do
      math = PyCall.import_module('math')
      math.sin(math.pi / 2)
    end
    assert_equal 1.0, result
  end
end
