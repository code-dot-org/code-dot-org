require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/mobile/sync_in'

describe I18n::Resources::Pegasus::Mobile::SyncIn do
  let(:described_class) {I18n::Resources::Pegasus::Mobile::SyncIn}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    assert_equal I18n::Utils::SyncInBase, described_class.superclass
  end

  describe '#process' do
    let(:process) {described_instance.process}

    let(:pegasus_i18n_file_path) {CDO.dir('pegasus/cache/i18n/en-US.json')}

    before do
      FileUtils.mkdir_p(File.dirname(pegasus_i18n_file_path))
      FileUtils.touch(pegasus_i18n_file_path)
    end

    it 'prepares the i18n source file' do
      execution_sequence = sequence('execution')

      I18nScriptUtils.expects(:fix_yml_file).with(pegasus_i18n_file_path).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:copy_file).with(pegasus_i18n_file_path, CDO.dir('i18n/locales/source/pegasus/mobile.json')).in_sequence(execution_sequence)

      process
    end
  end
end
