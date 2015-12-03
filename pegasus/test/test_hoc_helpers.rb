require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/mock_pegasus'

class HocHelpersTest < Minitest::Test
  def test_complete_tutorial_without_code
    complete_tutorial
  end
end
