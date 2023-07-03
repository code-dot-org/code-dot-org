require_relative '../../test_helper'
require_relative '../../../i18n/resources/animations'

class I18n::Resources::AnimationsTest < Minitest::Test
  def test_sync_in
    exec_seq = sequence('execution')

    expected_crowdin_animations_dir_path = CDO.dir('i18n/locales/source/animations')
    FileUtils.expects(:mkdir_p).with(expected_crowdin_animations_dir_path).in_sequence(exec_seq)

    manifest_builder = mock(get_animation_strings: {test: 'example'})
    ManifestBuilder.stubs(new: manifest_builder).with({spritelab: true, quiet: true})

    expected_file_path = CDO.dir('i18n/locales/source/animations/spritelab_animation_library.json')
    expected_file_data = %Q[{\n  "test": "example"\n}]
    File.expects(:write).with(expected_file_path, expected_file_data).in_sequence(exec_seq)

    I18n::Resources::Animations.sync_in
  end
end
