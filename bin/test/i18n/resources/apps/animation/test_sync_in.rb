require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/animations/sync_in'

class I18n::Resources::Apps::Animations::SyncInTest < Minitest::Test
  def setup
    STDOUT.stubs(:print)
  end

  def test_performing
    I18n::Resources::Apps::Animations::SyncIn.any_instance.expects(:execute)

    I18n::Resources::Apps::Animations::SyncIn.perform
  end

  def test_execution
    exec_seq = sequence('execution')

    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/animations')).in_sequence(exec_seq)

    manifest_builder = mock(get_animation_strings: {test: 'example'})
    ManifestBuilder.expects(new: manifest_builder).with({spritelab: true, quiet: true}).in_sequence(exec_seq)

    File.expects(:write).with(CDO.dir('i18n/locales/source/animations/spritelab_animation_library.json'), %Q[{\n  "test": "example"\n}]).in_sequence(exec_seq)

    I18n::Resources::Apps::Animations::SyncIn.new.execute
  end
end
