require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/apps/animations'

class I18n::Resources::Apps::AnimationsTest < Minitest::Test
  def test_sync_in
    exec_seq = sequence('execution')

    manifest_builder = mock(get_animation_strings: {test: 'example'})
    ManifestBuilder.stubs(new: manifest_builder).with({spritelab: true, quiet: true})

    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/animations')).in_sequence(exec_seq)
    File.expects(:write).with(CDO.dir('i18n/locales/source/animations/spritelab_animation_library.json'), %Q[{\n  "test": "example"\n}]).in_sequence(exec_seq)

    I18n::Resources::Apps::Animations.sync_in
  end
end
