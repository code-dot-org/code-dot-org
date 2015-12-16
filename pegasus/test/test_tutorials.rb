require_relative '../../deployment'
require_relative '../src/database'
require 'minitest/autorun'

class TutorialsTest < Minitest::Test

  def test_hoc_tutorial
    tutorials = Tutorials.new(:beyond_tutorials)
    tutorial = tutorials.find_with_tag('Beginner')
    assert tutorial.length > 0
  end
end
