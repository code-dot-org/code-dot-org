require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/hourofcode/sync_out'

describe I18n::Resources::Pegasus::HourOfCode::SyncOut do
  let(:described_class) {I18n::Resources::Pegasus::HourOfCode::SyncOut}
  let(:described_instance) {described_class.new}

  let(:crowdin_locale) {'Test'}
  let(:i18n_locale) {'te-ST'}
  let(:unique_language_code) {'expected_unique_language_code'}
  let(:language) {{crowdin_name_s: crowdin_locale, locale_s: i18n_locale, unique_language_s: unique_language_code}}
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

    describe 'origin i18n file distributing' do
      let(:i18n_origin_locale_file_path) {CDO.dir('i18n/locales', i18n_locale, "hourofcode/#{unique_language_code}.yml")}
      let(:crowdin_origin_en_file_path) {CDO.dir('i18n/locales', crowdin_locale, 'hourofcode/en.yml')}
      let(:crowdin_origin_en_file_content) {"---\n'en':\n  i18n_key: i18n_val\n"}
      let(:hoc_origin_i18n_file_path) {CDO.dir("pegasus/sites.v3/hourofcode.com/i18n/#{unique_language_code}.yml")}

      before do
        FileUtils.mkdir_p(File.dirname(crowdin_origin_en_file_path))
        File.write(crowdin_origin_en_file_path, crowdin_origin_en_file_content)
      end

      it 'distributes the origin i18n file with locale fix' do
        process_language

        refute File.exist?(crowdin_origin_en_file_path)
        assert File.exist?(hoc_origin_i18n_file_path)
        assert_equal "---\nexpected_unique_language_code:\n  i18n_key: i18n_val\n", File.read(hoc_origin_i18n_file_path)
      end

      it 'moves the fixed origin i18n file from crowdin locale dir to i18n locale dir' do
        process_language

        refute File.exist?(crowdin_origin_en_file_path)
        assert File.exist?(i18n_origin_locale_file_path)
        assert_equal "---\nexpected_unique_language_code:\n  i18n_key: i18n_val\n", File.read(i18n_origin_locale_file_path)
      end

      context 'when the locale is en-US' do
        let(:is_source_language) {true}
        let(:crowdin_locale) {'English'}
        let(:i18n_locale) {'en-US'}
        let(:unique_language_code) {'en'}

        it 'does not distribute the origin file' do
          process_language
          refute File.exist?(hoc_origin_i18n_file_path)
        end

        it 'moves the origin i18n file from crowdin locale dir to i18n locale dir without changes' do
          process_language

          refute File.exist?(crowdin_origin_en_file_path)
          assert File.exist?(i18n_origin_locale_file_path)
          assert_equal crowdin_origin_en_file_content, File.read(i18n_origin_locale_file_path)
        end
      end
    end

    # layout: wide
    describe 'markdown i18n files distributing' do
      let(:crowdin_markdown_file_path) {CDO.dir('i18n/locales', crowdin_locale, 'hourofcode/expected/markdown.md')}
      let(:crowdin_markdown_file_content) {'expected_crowdin_markdown_file_content'}
      let(:i18n_markdown_file_path) {CDO.dir('i18n/locales', i18n_locale, 'hourofcode/expected/markdown.md')}

      let(:hoc_markdown_file_path) {CDO.dir('pegasus/sites.v3/hourofcode.com/public/expected/markdown.md')}
      let(:hoc_markdown_i18n_file_path) {CDO.dir('pegasus/sites.v3/hourofcode.com/i18n/public', unique_language_code, 'expected/markdown.md.partial')}

      let(:expect_crowdin_file_to_hoc_markdown_i18n_dir_copying) do
        I18nScriptUtils.expects(:copy_file).with(crowdin_markdown_file_path, hoc_markdown_i18n_file_path)
      end
      let(:expect_hoc_markdown_i18n_file_header_restoring) do
        I18n::Utils::PegasusMarkdown.expects(:restore_file_header).with(
          hoc_markdown_file_path, hoc_markdown_i18n_file_path
        )
      end

      before do
        FileUtils.mkdir_p(File.dirname(crowdin_markdown_file_path))
        FileUtils.touch(crowdin_markdown_file_path)

        FileUtils.mkdir_p(File.dirname(hoc_markdown_file_path))
        FileUtils.touch(hoc_markdown_file_path)
      end

      it 'distributes the crowdin markdown file with restored sanitized headers' do
        execution_sequence = sequence('execution')

        expect_crowdin_file_to_hoc_markdown_i18n_dir_copying.in_sequence(execution_sequence)
        expect_hoc_markdown_i18n_file_header_restoring.in_sequence(execution_sequence)

        process_language
      end

      it 'moves the markdown i18n file from crowdin locale dir to i18n locale dir without changes' do
        process_language

        refute File.exist?(crowdin_markdown_file_path)
        assert File.exist?(i18n_markdown_file_path)
      end

      context 'when the language is the source language' do
        let(:is_source_language) {true}

        it 'does not distribute the crowdin markdown file with restored sanitized headers' do
          expect_crowdin_file_to_hoc_markdown_i18n_dir_copying.never
          expect_hoc_markdown_i18n_file_header_restoring.never

          process_language
        end

        it 'moves the markdown i18n file from crowdin locale dir to i18n locale dir without changes' do
          process_language

          refute File.exist?(crowdin_markdown_file_path)
          assert File.exist?(i18n_markdown_file_path)
        end
      end
    end
  end
end
