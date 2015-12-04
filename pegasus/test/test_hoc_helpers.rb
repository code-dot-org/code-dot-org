require_relative '../src/env'
require 'rack/test'
require 'minitest/autorun'

class HocHelpersTest < Minitest::Test
  def test_complete_tutorial_without_code
    complete_tutorial
  end
end
