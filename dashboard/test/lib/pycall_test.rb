require 'test_helper'
require 'pycall'

class PyCallTest < ActiveSupport::TestCase
  test 'pycall math library works' do
    math = PyCall.import_module('math')
    assert_equal 1.0, math.sin(math.pi / 2)
  end
end
