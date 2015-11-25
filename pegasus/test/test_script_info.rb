require_relative '../../lib/cdo/scripts/script_info'
require 'minitest/autorun'

class CertificateImageTest < Minitest::Test
  def test_name_constant
    assert_equal 'mc', ScriptInfo::MINECRAFT_NAME
  end

  def test_minecraft?
    assert ScriptInfo.minecraft?(ScriptInfo::MINECRAFT_NAME)
    assert !ScriptInfo.minecraft?(ScriptInfo::FROZEN_NAME)
  end

  def test_flappy?
    assert ScriptInfo.flappy?(ScriptInfo::FLAPPY_NAME)
    assert !ScriptInfo.flappy?(ScriptInfo::FROZEN_NAME)
  end

  def test_hoc?
    assert ScriptInfo.hoc?(ScriptInfo::HOC_2013_NAME)
    assert ScriptInfo.hoc?(ScriptInfo::HOC_NAME)
    assert ScriptInfo.hoc?(ScriptInfo::FROZEN_NAME)
    assert ScriptInfo.hoc?(ScriptInfo::FLAPPY_NAME)
    assert ScriptInfo.hoc?(ScriptInfo::PLAYLAB_NAME)
    assert ScriptInfo.hoc?(ScriptInfo::STARWARS_NAME)
    assert ScriptInfo.hoc?(ScriptInfo::STARWARS_BLOCKS_NAME)
    assert ScriptInfo.hoc?(ScriptInfo::MINECRAFT_NAME)
  end
end
