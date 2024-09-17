require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/mobile/sync_out'

describe I18n::Resources::Pegasus::Mobile::SyncOut do
  let(:described_class) {I18n::Resources::Pegasus::Mobile::SyncOut}
  let(:described_instance) {described_class.new}

  let(:i18n_locale) {'te-ST'}
  let(:language) {{locale_s: i18n_locale}}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '#process' do
    let(:process_language) {described_instance.process(language)}

    let(:crowdin_locale_dir) {CDO.dir('i18n/crowdin', i18n_locale)}
    let(:crowdin_resource_dir) {File.join(crowdin_locale_dir, 'pegasus')}
    let(:crowdin_file_path) {File.join(crowdin_resource_dir, 'mobile.json')}

    let(:i18n_file_path) {CDO.dir('i18n/locales', i18n_locale, 'pegasus/mobile.json')}

    let(:pegasus_i18n_file_path) {CDO.dir('pegasus/cache/i18n', "#{i18n_locale}.json")}

    let(:i18n_data) {{'some_key' => 'some_data'}}

    before do
      FileUtils.mkdir_p(File.dirname(crowdin_file_path))
      FileUtils.touch(crowdin_file_path)
      I18nScriptUtils.stubs(:sanitize_data_and_write)
    end

    it 'distributes the localization' do
      I18nScriptUtils.stubs(:parse_file).with(crowdin_file_path).returns(i18n_data)
      execution_sequence = sequence('execution')

      I18nScriptUtils.expects(:sanitize_data_and_write).with({i18n_locale => i18n_data}, pegasus_i18n_file_path).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:move_file).with(crowdin_file_path, i18n_file_path).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:remove_empty_dir).with(File.dirname(crowdin_file_path)).in_sequence(execution_sequence)

      process_language
    end

    context 'when the Crowdin file does not exist' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not distribute the localization' do
        I18nScriptUtils.expects(:sanitize_data_and_write).never
        I18nScriptUtils.expects(:move_file).never
        I18nScriptUtils.expects(:remove_empty_dir).never

        process_language
      end
    end
  end
end
