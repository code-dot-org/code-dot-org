require_relative '../../deployment'
require_relative '../src/database'
require 'minitest/autorun'

class TutorialsTest < Minitest::Test
  def test_hoc_tutorials
    hoc_tutorials = Tutorials.new(:tutorials)
    frozen_tutorial = hoc_tutorials.find_with_tag("frozen")

    refute_empty frozen_tutorial
    assert_equal 'frozen', frozen_tutorial["frozen"][:code]
  end

  def test_beyond_hoc_tutorials
    beyond_tutorials = Tutorials.new(:beyond_tutorials)
    beginner_tutorials = beyond_tutorials.find_with_tag("Beginner")

    refute_empty beginner_tutorials
    assert_equal 'codeorg_beyond', beginner_tutorials["codeorg_beyond"][:code]
  end

  def test_tutorials_contents_immutable
    Tutorials.new(:tutorials) # Warm cache

    tutorial = Tutorials.new(:tutorials).contents('code.org').first
    tutorial[:image] = 'xyz'
    refute_equal Tutorials.new(:tutorials).contents('code.org').first[:image], tutorial[:image]
  end
end
