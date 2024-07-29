require 'test_helper'
require 'pycall'

class PyCallTest < ActiveSupport::TestCase
  test 'pycall math library works' do
    math = PyCall.import_module('math')
    assert_equal 1.0, math.sin(math.pi / 2)
  end

  test 'import boto3 from site-packages works' do
    boto3 = PyCall.import_module('boto3')
    assert_equal 'boto3', boto3.__name__
  end
end
