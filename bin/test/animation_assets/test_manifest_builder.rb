require_relative '../test_helper'
require_relative '../../animation_assets/manifest_builder'

class ManifestBuilderTest < Minitest::Test
  def test_get_animation_strings_for_spritelab_quietly
    animation_strings = nil

    VCR.use_cassette('animations/manifest_spritelab_strings') do
      animation_strings = ManifestBuilder.new(spritelab: true, quite: true).get_animation_strings
    end

    assert_equal({'test_alias_1' => 'test_alias_1', 'test_alias_2' => 'test_alias_2'}, animation_strings)
  end
end
