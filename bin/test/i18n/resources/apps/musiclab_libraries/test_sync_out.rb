require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/musiclab_libraries/sync_out'

describe I18n::Resources::Apps::MusiclabLibraries::SyncOut do
  let(:described_class) {I18n::Resources::Apps::MusiclabLibraries::SyncOut}
  let(:described_instance) {described_class.new}

  let(:i18n_locale) {'uk-UA'}
  let(:js_locale) {'uk_ua'}
  let(:language) {{locale_s: i18n_locale}}

  # around do |test|
  #   FakeFS.with_fresh {test.call}
  # end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '#process' do
    let(:process_language) {described_instance.process(language)}

    let(:is_testing) {false}
    let(:options) {{testing: is_testing}}

    let(:crowdin_file_path) {CDO.dir('i18n/crowdin', i18n_locale, 'musiclab_libraries/music-library-intro2024.json')}
    let(:crowdin_file_data) {{'i18n_key' => 'i18n_val'}}
    let(:i18n_file_path) {CDO.dir('i18n/locales', i18n_locale, 'musiclab_libraries/music-library-intro2024.json')}

    let(:i18n_data) {crowdin_file_data}

    let(:expect_translation_upload) do
      described_instance.expects(:upload_localized_strings).with(js_locale, crowdin_file_data)
    end
    let(:expect_crowdin_file_to_i18n_locale_dir_moving) do
      I18nScriptUtils.expects(:move_file).with(crowdin_file_path, i18n_file_path)
    end
    let(:expect_crowdin_resource_dir_removing) do
      I18nScriptUtils.expects(:remove_empty_dir).with(File.dirname(crowdin_file_path))
    end

    before do
      described_instance.stubs(:options).returns(options)

      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      File.write crowdin_file_path, JSON.dump(crowdin_file_data)
    end

    it 'uploads localized manifest and then moves the Crowdin file to the i18n locale dir' do
      execution_sequence = sequence('execution')

      expect_translation_upload.in_sequence(execution_sequence)
      expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)
      expect_crowdin_resource_dir_removing.in_sequence(execution_sequence)

      process_language
    end

    context 'when testing' do
      let(:is_testing) {true}

      it 'does not upload localized manifest' do
        expect_translation_upload.never
        expect_crowdin_file_to_i18n_locale_dir_moving.once

        process_language
      end
    end

    context 'when the Crowdin locale dir does not exists' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not upload localized manifest' do
        expect_translation_upload.never

        process_language
      end

      it 'does not move the Crowdin file to the i18n locale dir' do
        expect_crowdin_file_to_i18n_locale_dir_moving.never
        expect_crowdin_resource_dir_removing.never

        process_language
      end
    end
  end
end
