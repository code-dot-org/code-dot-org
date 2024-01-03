require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/animations/sync_out'

describe I18n::Resources::Apps::Animations::SyncOut do
  let(:described_class) {I18n::Resources::Apps::Animations::SyncOut}
  let(:described_instance) {described_class.new}

  let(:spritelab_manifest_builder) {stub}

  let(:crowdin_locale) {'expected_crowdin_locale'}
  let(:i18n_locale) {'uk-UA'}
  let(:js_locale) {'uk_ua'}
  let(:language) {{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  before do
    ManifestBuilder.any_instance.stubs(:initial_animation_metadata)
    ManifestBuilder.any_instance.stubs(:upload_localized_manifest)
    ManifestBuilder.stubs(:new).with({spritelab: true, upload_to_s3: true, quiet: true}).returns(spritelab_manifest_builder)
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '#process' do
    let(:process_language) {described_instance.process(language)}

    let(:crowdin_file_path) {CDO.dir('i18n/locales', crowdin_locale, 'animations/spritelab_animation_library.json')}
    let(:crowdin_file_data) {{'i18n_key' => 'i18n_val'}}
    let(:i18n_file_path) {CDO.dir('i18n/locales', i18n_locale, 'animations/spritelab_animation_library.json')}

    let(:is_source_lang) {false}
    let(:i18n_data) {crowdin_file_data}

    let(:expect_localized_manifest_uploading) do
      spritelab_manifest_builder.expects(:upload_localized_manifest).with(js_locale, i18n_data)
    end
    let(:expect_crowdin_file_to_i18n_locale_dir_moving) do
      I18nScriptUtils.expects(:move_file).with(crowdin_file_path, i18n_file_path)
    end

    before do
      I18nScriptUtils.stubs(:source_lang?).with(language).returns(is_source_lang)

      FileUtils.mkdir_p File.dirname(crowdin_file_path)
      File.write crowdin_file_path, JSON.dump(crowdin_file_data)
    end

    it 'uploads localized manifest and then moves the Crowdin file to the i18n locale dir' do
      execution_sequence = sequence('execution')

      spritelab_manifest_builder.expects(:initial_animation_metadata).in_sequence(execution_sequence)
      expect_localized_manifest_uploading.in_sequence(execution_sequence)
      expect_crowdin_file_to_i18n_locale_dir_moving.in_sequence(execution_sequence)

      process_language
    end

    context 'when the Crowdin locale dir does not exists' do
      before do
        FileUtils.rm(crowdin_file_path)
      end

      it 'does not upload localized manifest' do
        expect_localized_manifest_uploading.never
        process_language
      end

      it 'does not move the Crowdin file to the i18n locale dir' do
        expect_crowdin_file_to_i18n_locale_dir_moving.never
        process_language
      end
    end

    context 'when the language is the source language' do
      let(:is_source_lang) {true}

      it 'does not upload localized manifest' do
        expect_localized_manifest_uploading.never
        process_language
      end

      it 'moves the Crowdin file to the i18n locale dir' do
        expect_crowdin_file_to_i18n_locale_dir_moving.once
        process_language
      end
    end
  end
end
