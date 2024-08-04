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

    let(:original_i18n_file_path) {CDO.dir('pegasus/cache/i18n/en-US.json')}
    let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/pegasus/mobile.json')}
    let(:i18n_data) {{'en-US' => 'some_data'}}

    before do
      FileUtils.mkdir_p(File.dirname(original_i18n_file_path))
      FileUtils.touch(original_i18n_file_path)
      I18nScriptUtils.stubs(:sanitize_data_and_write)
    end

    it 'prepares the i18n source file' do
      I18nScriptUtils.stubs(:parse_file).with(original_i18n_file_path).returns(i18n_data)
      I18nScriptUtils.expects(:sanitize_data_and_write).with('some_data', i18n_source_file_path)

      process
    end

    it 'handles missing i18n file gracefully' do
      FileUtils.rm(original_i18n_file_path) # Ensure the file is removed
      I18nScriptUtils.stubs(:parse_file).with(original_i18n_file_path).returns(nil)
      I18nScriptUtils.expects(:sanitize_data_and_write).never # No sanitize call expected
      assert_raises(RuntimeError, /i18n data is missing or invalid/) do
        process.call
      end
    end
  end
end
