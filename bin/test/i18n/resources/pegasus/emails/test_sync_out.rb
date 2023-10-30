require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/emails/sync_out'

describe I18n::Resources::Pegasus::Emails::SyncOut do
  def around
    FakeFS.with_fresh {yield}
  end

  before do
    STDOUT.stubs(:print)
    I18n::Utils::PegasusMarkdown.stubs(:restore_file_header)
  end

  describe '.perform' do
    it 'calls #execute' do
      I18n::Resources::Pegasus::Emails::SyncOut.any_instance.expects(:execute).once

      I18n::Resources::Pegasus::Emails::SyncOut.perform
    end
  end

  describe '#execute' do
    let(:sync_out) {I18n::Resources::Pegasus::Emails::SyncOut.new}

    let(:crowdin_locale) {'Not English'}
    let(:i18n_locale) {'not-EN'}
    let(:unique_language_code) {'expected_unique_language_code'}

    let(:crowdin_locale_dir) {CDO.dir('i18n/locales', crowdin_locale)}
    let(:crowdin_locale_resource_dir) {File.join(crowdin_locale_dir, 'emails')}
    let(:crowdin_file_path) {File.join(crowdin_locale_resource_dir, 'test.md')}
    let(:origin_markdown_file_path) {CDO.dir('pegasus/emails/test.md')}
    let(:markdown_i18n_file_path) {CDO.dir('pegasus/emails/i18n/test.not-EN.md.partial')}

    let(:expect_localization_distribution) do
      I18nScriptUtils.expects(:copy_file).with(crowdin_file_path, markdown_i18n_file_path)
    end
    let(:expect_markdown_i18n_file_header_restoration) do
      I18n::Utils::PegasusMarkdown.expects(:restore_file_header).with(origin_markdown_file_path, markdown_i18n_file_path)
    end
    let(:expect_crowdin_locale_resource_dir_removing) do
      FileUtils.expects(:rm_r).with(crowdin_locale_resource_dir)
    end
    let(:expect_empty_crowdin_locale_dir_removing) do
      I18nScriptUtils.expects(:remove_empty_dir).with(crowdin_locale_dir)
    end

    before do
      PegasusLanguages.stubs(:get_crowdin_name_and_locale).returns([{crowdin_name_s: crowdin_locale, locale_s: i18n_locale, unique_language_s: unique_language_code}])

      FileUtils.mkdir_p(File.dirname(crowdin_file_path))
      FileUtils.touch(crowdin_file_path)

      FileUtils.mkdir_p(File.dirname(origin_markdown_file_path))
      FileUtils.touch(origin_markdown_file_path)
    end

    it 'distributes the emails localization with restored header' do
      execution_sequence = sequence('execution')

      expect_localization_distribution.in_sequence(execution_sequence)
      expect_markdown_i18n_file_header_restoration.in_sequence(execution_sequence)
      expect_crowdin_locale_resource_dir_removing.in_sequence(execution_sequence)
      expect_empty_crowdin_locale_dir_removing.in_sequence(execution_sequence)

      sync_out.execute
    end

    context 'when a "view" Crowdin file exists' do
      let(:crowdin_file_path) {File.join(crowdin_locale_resource_dir, 'test.md')}
      let(:origin_markdown_file_path) {CDO.dir('pegasus/emails/test.md.partial')}
      let(:markdown_i18n_file_path) {CDO.dir('pegasus/emails/i18n/test.not-EN.md.partial')}

      it 'distributes the emails localization with restored header' do
        execution_sequence = sequence('execution')

        expect_localization_distribution.in_sequence(execution_sequence)
        expect_markdown_i18n_file_header_restoration.in_sequence(execution_sequence)
        expect_crowdin_locale_resource_dir_removing.in_sequence(execution_sequence)
        expect_empty_crowdin_locale_dir_removing.in_sequence(execution_sequence)

        sync_out.execute
      end
    end

    context 'when the locale is en-US' do
      let(:crowdin_locale) {'English'}
      let(:i18n_locale) {'en-US'}

      it 'does not distribute the emails localization' do
        execution_sequence = sequence('execution')

        expect_localization_distribution.never
        expect_markdown_i18n_file_header_restoration.never
        expect_crowdin_locale_resource_dir_removing.in_sequence(execution_sequence)
        expect_empty_crowdin_locale_dir_removing.in_sequence(execution_sequence)

        sync_out.execute
      end
    end

    context 'when the origin emails file does not exists' do
      before do
        FileUtils.rm(origin_markdown_file_path)
      end

      it 'does not distribute the emails localization' do
        execution_sequence = sequence('execution')

        expect_localization_distribution.never
        expect_markdown_i18n_file_header_restoration.never
        expect_crowdin_locale_resource_dir_removing.in_sequence(execution_sequence)
        expect_empty_crowdin_locale_dir_removing.in_sequence(execution_sequence)

        sync_out.execute
      end
    end
  end
end
