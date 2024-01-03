require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/markdown/sync_out'

describe I18n::Resources::Pegasus::Markdown::SyncOut do
  let(:described_class) {I18n::Resources::Pegasus::Markdown::SyncOut}
  let(:described_instance) {described_class.new}

  let(:crowdin_locale) {'Test'}
  let(:i18n_locale) {'te-ST'}
  let(:language) {{crowdin_name_s: crowdin_locale, locale_s: i18n_locale}}
  let(:is_source_language) {false}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  before do
    I18nScriptUtils.stubs(:source_lang?).with(language).returns(is_source_language)
    I18n::Utils::PegasusMarkdown.stubs(:restore_file_header)
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe '#process' do
    let(:process_language) {described_instance.process(language)}

    let(:crowdin_locale_dir) {CDO.dir('i18n/locales', crowdin_locale)}
    let(:crowdin_locale_resource_dir) {File.join(crowdin_locale_dir, 'codeorg-markdown')}
    let(:crowdin_file_path) {File.join(crowdin_locale_resource_dir, 'test.md')}
    let(:origin_markdown_file_path) {CDO.dir('pegasus/sites.v3/code.org/public/test.md')}
    let(:markdown_i18n_file_path) {CDO.dir("pegasus/sites.v3/code.org/i18n/public/test.#{i18n_locale}.md.partial")}

    let(:expect_localization_distribution) do
      I18nScriptUtils.expects(:copy_file).with(crowdin_file_path, markdown_i18n_file_path)
    end
    let(:expect_markdown_i18n_file_header_restoration) do
      I18n::Utils::PegasusMarkdown.expects(:restore_file_header).with(origin_markdown_file_path, markdown_i18n_file_path)
    end
    let(:expect_crowdin_locale_resource_dir_removing) do
      FileUtils.expects(:rm_r).with(crowdin_locale_resource_dir)
    end

    before do
      FileUtils.mkdir_p(File.dirname(crowdin_file_path))
      FileUtils.touch(crowdin_file_path)

      FileUtils.mkdir_p(File.dirname(origin_markdown_file_path))
      FileUtils.touch(origin_markdown_file_path)
    end

    it 'distributes the markdown localization with restored header' do
      execution_sequence = sequence('execution')

      expect_localization_distribution.in_sequence(execution_sequence)
      expect_markdown_i18n_file_header_restoration.in_sequence(execution_sequence)
      expect_crowdin_locale_resource_dir_removing.in_sequence(execution_sequence)

      process_language
    end

    context 'when a "view" Crowdin file exists' do
      let(:crowdin_file_path) {File.join(crowdin_locale_resource_dir, 'views/test.md')}
      let(:origin_markdown_file_path) {CDO.dir('pegasus/sites.v3/code.org/views/test.md.partial')}
      let(:markdown_i18n_file_path) {CDO.dir("pegasus/sites.v3/code.org/i18n/views/test.#{i18n_locale}.md.partial")}

      it 'distributes the markdown localization with restored header' do
        execution_sequence = sequence('execution')

        expect_localization_distribution.in_sequence(execution_sequence)
        expect_markdown_i18n_file_header_restoration.in_sequence(execution_sequence)
        expect_crowdin_locale_resource_dir_removing.in_sequence(execution_sequence)

        process_language
      end
    end

    context 'when the language is the source language' do
      let(:is_source_language) {true}

      it 'does not distribute the markdown localization' do
        execution_sequence = sequence('execution')

        expect_localization_distribution.never
        expect_markdown_i18n_file_header_restoration.never
        expect_crowdin_locale_resource_dir_removing.in_sequence(execution_sequence)

        process_language
      end
    end

    context 'when the origin markdown file does not exists' do
      before do
        FileUtils.rm(origin_markdown_file_path)
      end

      it 'does not distribute the markdown localization' do
        execution_sequence = sequence('execution')

        expect_localization_distribution.never
        expect_markdown_i18n_file_header_restoration.never
        expect_crowdin_locale_resource_dir_removing.in_sequence(execution_sequence)

        process_language
      end
    end
  end
end
