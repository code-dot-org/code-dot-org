require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/mobile/sync_in'

describe I18n::Resources::Pegasus::Mobile::SyncIn do
  def around
    FakeFS.with_fresh {yield}
  end

  before do
    STDOUT.stubs(:print)
  end

  describe '.perform' do
    it 'calls #execute' do
      I18n::Resources::Pegasus::Mobile::SyncIn.any_instance.expects(:execute).once

      I18n::Resources::Pegasus::Mobile::SyncIn.perform
    end
  end

  describe '#execute' do
    let(:sync_in) {I18n::Resources::Pegasus::Mobile::SyncIn.new}

    let(:pegasus_i18n_file_path) {CDO.dir('pegasus/cache/i18n/en-US.yml')}

    before do
      FileUtils.mkdir_p(File.dirname(pegasus_i18n_file_path))
      FileUtils.touch(pegasus_i18n_file_path)
    end

    it 'prepares the i18n source file' do
      execution_sequence = sequence('execution')

      I18nScriptUtils.expects(:fix_yml_file).with(pegasus_i18n_file_path).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:copy_file).with(pegasus_i18n_file_path, CDO.dir('i18n/locales/source/pegasus/mobile.yml')).in_sequence(execution_sequence)

      sync_in.execute
    end
  end
end
