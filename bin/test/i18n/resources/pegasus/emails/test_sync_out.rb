require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/emails/sync_out'

describe I18n::Resources::Pegasus::Emails::SyncOut do
  let(:described_class) {I18n::Resources::Pegasus::Emails::SyncOut}
  let(:described_instance) {described_class.new}

  let(:crowdin_locale) {'Not-English'}
  let(:i18n_locale) {'not-EN'}
  let(:language) {{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}}
  let(:is_source_language) {false}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  before do
    I18nScriptUtils.stubs(:source_lang?).with(language).returns(is_source_language)
    I18n::Utils::PegasusEmail.stubs(:restore_file_header)
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '#process' do
    let(:process_language) {described_instance.process(language)}

    let(:crowdin_locale_dir) {CDO.dir('i18n/locales', crowdin_locale)}
    let(:crowdin_locale_resource_dir) {File.join(crowdin_locale_dir, 'pegasus/emails')}
    let(:crowdin_file_path) {File.join(crowdin_locale_resource_dir, 'test.md')}
    let(:origin_email_file_path) {CDO.dir('pegasus/emails/test.md')}
    let(:email_i18n_file_path) {CDO.dir('pegasus/emails/i18n/test_not-EN.md')}

    let(:expect_localization_distribution) do
      I18nScriptUtils.expects(:copy_file).with(crowdin_file_path, email_i18n_file_path)
    end
    let(:expect_markdown_i18n_file_header_restoration) do
      I18n::Utils::PegasusEmail.expects(:restore_file_header).with(origin_email_file_path, email_i18n_file_path)
    end
    let(:expect_crowdin_locale_resource_dir_removing) do
      FileUtils.expects(:rm_r).with(crowdin_locale_resource_dir)
    end

    before do
      FileUtils.mkdir_p(File.dirname(crowdin_file_path))
      FileUtils.touch(crowdin_file_path)

      FileUtils.mkdir_p(File.dirname(origin_email_file_path))
      FileUtils.touch(origin_email_file_path)
    end

    it 'distributes the emails localization with restored header' do
      execution_sequence = sequence('execution')

      expect_localization_distribution.in_sequence(execution_sequence)
      expect_markdown_i18n_file_header_restoration.in_sequence(execution_sequence)
      expect_crowdin_locale_resource_dir_removing.in_sequence(execution_sequence)

      process_language
    end

    context 'when the language is the source language' do
      let(:is_source_language) {true}

      it 'does not distribute localized emails' do
        execution_sequence = sequence('execution')

        expect_localization_distribution.never
        expect_markdown_i18n_file_header_restoration.never
        expect_crowdin_locale_resource_dir_removing.in_sequence(execution_sequence)

        process_language
      end
    end

    context 'when the origin emails file does not exists' do
      before do
        FileUtils.rm(origin_email_file_path)
      end

      it 'does not distribute localized emails' do
        execution_sequence = sequence('execution')

        expect_localization_distribution.never
        expect_markdown_i18n_file_header_restoration.never
        expect_crowdin_locale_resource_dir_removing.in_sequence(execution_sequence)

        process_language
      end
    end
  end
end
