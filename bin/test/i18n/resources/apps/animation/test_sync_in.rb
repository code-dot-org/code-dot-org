require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/animations/sync_in'

class I18n::Resources::Apps::Animations::SyncInTest < Minitest::Test
  def test_performing
    exec_seq = sequence('execution')

    manifest_builder = mock(get_animation_strings: {test: 'example'})
    ManifestBuilder.stubs(new: manifest_builder).with({spritelab: true, quiet: true})

    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/animations')).in_sequence(exec_seq)
    File.expects(:write).with(CDO.dir('i18n/locales/source/animations/spritelab_animation_library.json'), %Q[{\n  "test": "example"\n}]).in_sequence(exec_seq)

    I18n::Resources::Apps::Animations::SyncIn.perform
  end
end
