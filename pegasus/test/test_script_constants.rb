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
    assert ScriptConstants.script_in_category?(:minecraft, ScriptConstants::MINECRAFT_NAME)
    assert !ScriptConstants.script_in_category?(:minecraft, ScriptConstants::FROZEN_NAME)
  end

  def test_flappy?
    assert ScriptConstants.script_in_category?(:flappy, ScriptConstants::FLAPPY_NAME)
    assert !ScriptConstants.script_in_category?(:flappy, ScriptConstants::FROZEN_NAME)
  end

  def test_hoc?
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::HOC_2013_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::HOC_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::FROZEN_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::FLAPPY_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::PLAYLAB_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::STARWARS_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::STARWARS_BLOCKS_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::MINECRAFT_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::INFINITY_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::ARTIST_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::GUMBALL_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::ICEAGE_NAME)
    assert !ScriptConstants.script_in_category?(:hoc, ScriptConstants::COURSE4_NAME)
  end

  def test_category
    assert_equal ['hoc'], ScriptConstants.categories(ScriptConstants::HOC_NAME)
    assert_equal ['hoc'], ScriptConstants.categories(ScriptConstants::STARWARS_NAME)
    assert_equal ['hoc', 'flappy'], ScriptConstants.categories(ScriptConstants::FLAPPY_NAME)
    assert_equal ['csf'], ScriptConstants.categories(ScriptConstants::COURSE1_NAME)
    assert_equal ['csp'], ScriptConstants.categories(ScriptConstants::CSP_UNIT1_NAME)
  end
end
