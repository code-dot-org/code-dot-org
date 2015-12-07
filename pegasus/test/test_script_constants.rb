require_relative '../../lib/cdo/script_constants'
require 'minitest/autorun'

class ScriptConstantsTest < Minitest::Test
  def test_name_constant
    assert_equal 'starwars', ScriptConstants::STARWARS_NAME
    assert_equal 'starwarsblocks', ScriptConstants::STARWARS_BLOCKS_NAME
    assert_equal 'mc', ScriptConstants::MINECRAFT_NAME
    assert_equal 'hourofcode', ScriptConstants::HOC_NAME
    assert_equal 'frozen', ScriptConstants::FROZEN_NAME
    assert_equal 'flappy', ScriptConstants::FLAPPY_NAME
  end

  def test_minecraft?
    assert ScriptConstants.minecraft?(ScriptConstants::MINECRAFT_NAME)
    assert !ScriptConstants.minecraft?(ScriptConstants::FROZEN_NAME)
  end

  def test_flappy?
    assert ScriptConstants.flappy?(ScriptConstants::FLAPPY_NAME)
    assert !ScriptConstants.flappy?(ScriptConstants::FROZEN_NAME)
  end

  def test_hoc?
    assert ScriptConstants.hoc?(ScriptConstants::HOC_2013_NAME)
    assert ScriptConstants.hoc?(ScriptConstants::HOC_NAME)
    assert ScriptConstants.hoc?(ScriptConstants::FROZEN_NAME)
    assert ScriptConstants.hoc?(ScriptConstants::FLAPPY_NAME)
    assert ScriptConstants.hoc?(ScriptConstants::PLAYLAB_NAME)
    assert ScriptConstants.hoc?(ScriptConstants::STARWARS_NAME)
    assert ScriptConstants.hoc?(ScriptConstants::STARWARS_BLOCKS_NAME)
    assert ScriptConstants.hoc?(ScriptConstants::MINECRAFT_NAME)
    assert ScriptConstants.hoc?(ScriptConstants::INFINITY_NAME)
    assert ScriptConstants.hoc?(ScriptConstants::ARTIST_NAME)
    assert ScriptConstants.hoc?(ScriptConstants::GUMBALL_NAME)
    assert ScriptConstants.hoc?(ScriptConstants::ICEAGE_NAME)
    assert !ScriptConstants.hoc?(ScriptConstants::COURSE4_NAME)
  end
end
