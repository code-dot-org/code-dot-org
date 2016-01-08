require_relative '../../deployment'
require_relative '../src/database'
require 'minitest/autorun'

class TutorialsTest < Minitest::Test

  def test_hoc_tutorials
    hoc_tutorials = Tutorials.new(:tutorials)
    frozen_tutorial = hoc_tutorials.find_with_tag("frozen")

    assert frozen_tutorial.length > 0
    assert frozen_tutorial["frozen"][:code] == "frozen"
  end

  def test_beyond_hoc_tutorials
    beyond_tutorials = Tutorials.new(:beyond_tutorials)
    beginner_tutorials = beyond_tutorials.find_with_tag("Beginner")

    assert beginner_tutorials.length > 0
    assert beginner_tutorials["codeorg_beyond"][:code] == "codeorg_beyond"
  end

end
