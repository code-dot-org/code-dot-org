require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/musiclab_libraries/sync_out'

describe I18n::Resources::Apps::MusiclabLibraries::SyncOut do
  let(:described_class) {I18n::Resources::Apps::MusiclabLibraries::SyncOut}
  let(:described_instance) {described_class.new}

  let(:library_filenames) {['music-library-intro2024', 'music-library-launch2024']}
  let(:i18n_locale) {'uk-UA'}
  let(:js_locale) {'uk_ua'}
  let(:language) {{locale_s: i18n_locale}}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '#process' do
    let(:process_language) {described_instance.process(language)}

    let(:is_testing) {false}
    let(:options) {{testing: is_testing}}

    let(:crowdin_file_data) {{'i18n_key' => 'i18n_val'}}
    let(:i18n_data) {crowdin_file_data}

    let(:expect_translation_upload) do
      described_instance.expects(:upload_localized_strings)
    end

    before do
      described_instance.stubs(:options).returns(options)

      library_filenames.each do |name|
        crowdin_file_path = CDO.dir('i18n/crowdin', i18n_locale, "musiclab_libraries/#{name}.json")
        FileUtils.mkdir_p File.dirname(crowdin_file_path)
        File.write crowdin_file_path, JSON.dump(crowdin_file_data)
      end
    end

    it 'uploads localized manifest and then moves the Crowdin file to the i18n locale dir' do
      execution_sequence = sequence('execution')

      library_filenames.each do |name|
        described_instance.expects(:upload_localized_strings).with(js_locale, crowdin_file_data, name).in_sequence(execution_sequence)

        i18n_file_path = CDO.dir('i18n/locales', i18n_locale, "musiclab_libraries/#{name}.json")
        crowdin_file_path = CDO.dir('i18n/crowdin', i18n_locale, "musiclab_libraries/#{name}.json")
        I18nScriptUtils.expects(:move_file).with(crowdin_file_path, i18n_file_path).in_sequence(execution_sequence)
        I18nScriptUtils.expects(:remove_empty_dir).with(File.dirname(crowdin_file_path)).in_sequence(execution_sequence)
      end

      process_language
    end

    context 'when testing' do
      let(:is_testing) {true}

      it 'does not upload localized manifest' do
        expect_translation_upload.never
        I18nScriptUtils.expects(:move_file).twice

        process_language
      end
    end

    context 'when the Crowdin locale dir does not exists' do
      before do
        library_filenames.each do |name|
          FileUtils.rm(CDO.dir('i18n/crowdin', i18n_locale, "musiclab_libraries/#{name}.json"))
        end
      end

      it 'does not upload localized manifest' do
        expect_translation_upload.never

        process_language
      end

      it 'does not move the Crowdin file to the i18n locale dir' do
        I18nScriptUtils.expects(:move_file).never
        I18nScriptUtils.expects(:remove_empty_dir).never

        process_language
      end
    end
  end
end
