require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/hourofcode/sync_in'

describe I18n::Resources::Pegasus::HourOfCode::SyncOut do
  class I18n::Resources::Pegasus::HourOfCode::SyncOut::Documents; end

  let(:pegasus_documents_helper) {stub}

  def around
    FakeFS.with_fresh {yield}
  end

  before do
    STDOUT.stubs(:print)
    I18n::Resources::Pegasus::HourOfCode::SyncOut::Documents.stubs(new: stub(helpers: pegasus_documents_helper))
  end

  describe '.perform' do
    it 'calls #execute' do
      I18n::Resources::Pegasus::HourOfCode::SyncOut.any_instance.expects(:execute).once

      I18n::Resources::Pegasus::HourOfCode::SyncOut.perform
    end
  end

  describe '#execute' do
    let(:sync_out) {I18n::Resources::Pegasus::HourOfCode::SyncOut.new}

    let(:crowdin_locale) {'Not English'}
    let(:i18n_locale) {'not-EN'}
    let(:unique_language_code) {'expected_unique_language_code'}

    let(:crowdin_locale_resource_dir) {CDO.dir('i18n/locales', crowdin_locale, 'hourofcode')}

    before do
      PegasusLanguages.stubs(:hoc_languages).returns([{crowdin_name_s: crowdin_locale, locale_s: i18n_locale, unique_language_s: unique_language_code}])
    end

    context 'when the crowdin locale resource dir exists' do
      before do
        FileUtils.mkdir_p(crowdin_locale_resource_dir)
      end

      it 'removes empty crowdin locale dir' do
        I18nScriptUtils.expects(:remove_empty_dir).with(File.dirname(crowdin_locale_resource_dir)).once
        sync_out.execute
      end
    end

    context 'when the crowdin locale resource dir does not exist' do
      it 'does not try to remove empty crowdin locale dir' do
        I18nScriptUtils.expects(:remove_empty_dir).with(File.dirname(crowdin_locale_resource_dir)).never
        sync_out.execute
      end
    end

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
        sync_out.execute

        refute File.exist?(crowdin_origin_en_file_path)
        assert File.exist?(hoc_origin_i18n_file_path)
        assert_equal "---\nexpected_unique_language_code:\n  i18n_key: i18n_val\n", File.read(hoc_origin_i18n_file_path)
      end

      it 'moves the fixed origin i18n file from crowdin locale dir to i18n locale dir' do
        sync_out.execute

        refute File.exist?(crowdin_origin_en_file_path)
        assert File.exist?(i18n_origin_locale_file_path)
        assert_equal "---\nexpected_unique_language_code:\n  i18n_key: i18n_val\n", File.read(i18n_origin_locale_file_path)
      end

      context 'when the locale is en-US' do
        let(:crowdin_locale) {'English'}
        let(:i18n_locale) {'en-US'}
        let(:unique_language_code) {'en'}

        it 'does not distribute the origin file' do
          sync_out.execute
          refute File.exist?(hoc_origin_i18n_file_path)
        end

        it 'moves the origin i18n file from crowdin locale dir to i18n locale dir without changes' do
          sync_out.execute

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
      let(:hoc_markdown_file_content) {'expected_crowdin_markdown_file_content'}
      let(:hoc_markdown_header) {{title: 'hoc_markdown_header_title', layout: 'hoc_markdown_header_layout'}}

      let(:hoc_markdown_i18n_file_path) {CDO.dir('pegasus/sites.v3/hourofcode.com/i18n/public', unique_language_code, 'expected/markdown.md.partial')}
      let(:hoc_markdown_i18n_header) {{title: 'hoc_markdown_i18n_header_title'}}
      let(:hoc_markdown_i18n_content) {'expected_hoc_markdown_i18n_content'}
      let(:hoc_markdown_i18n_sanitized_header) {{title: 'hoc_markdown_i18n_sanitized_header_title'}}

      let(:expect_crowdin_file_to_hoc_markdown_i18n_dir_copying) do
        I18nScriptUtils.expects(:copy_file).with(crowdin_markdown_file_path, hoc_markdown_i18n_file_path)
      end
      let(:expect_hoc_markdown_i18n_file_header_restoring) do
        I18nScriptUtils.expects(:write_markdown_with_header).with(
          hoc_markdown_i18n_content,
          {title: 'hoc_markdown_i18n_sanitized_header_title', layout: 'hoc_markdown_header_layout'},
          hoc_markdown_i18n_file_path
        )
      end

      before do
        FileUtils.mkdir_p(File.dirname(crowdin_markdown_file_path))
        File.write(crowdin_markdown_file_path, crowdin_markdown_file_content)

        FileUtils.mkdir_p(File.dirname(hoc_markdown_file_path))
        File.write(hoc_markdown_file_path, hoc_markdown_file_content)

        pegasus_documents_helper.stubs(:parse_yaml_header).with(hoc_markdown_file_path).returns([hoc_markdown_header])
        pegasus_documents_helper.stubs(:parse_yaml_header).with(hoc_markdown_i18n_file_path).returns([hoc_markdown_i18n_header, hoc_markdown_i18n_content])
        I18nScriptUtils.stubs(:sanitize_markdown_header).with(hoc_markdown_i18n_header).returns(hoc_markdown_i18n_sanitized_header)
      end

      it 'distributes the crowdin markdown file with restored sanitized headers' do
        execution_sequence = sequence('execution')

        expect_crowdin_file_to_hoc_markdown_i18n_dir_copying.in_sequence(execution_sequence)
        expect_hoc_markdown_i18n_file_header_restoring.in_sequence(execution_sequence)

        sync_out.execute
      end

      it 'moves the markdown i18n file from crowdin locale dir to i18n locale dir without changes' do
        sync_out.execute

        refute File.exist?(crowdin_markdown_file_path)
        assert File.exist?(i18n_markdown_file_path)
      end

      context 'when the locale is en-US' do
        let(:crowdin_locale) {'English'}
        let(:i18n_locale) {'en-US'}
        let(:unique_language_code) {'en'}

        it 'does not distribute the crowdin markdown file with restored sanitized headers' do
          expect_crowdin_file_to_hoc_markdown_i18n_dir_copying.never
          expect_hoc_markdown_i18n_file_header_restoring.never

          sync_out.execute
        end

        it 'moves the markdown i18n file from crowdin locale dir to i18n locale dir without changes' do
          sync_out.execute

          refute File.exist?(crowdin_markdown_file_path)
          assert File.exist?(i18n_markdown_file_path)
        end
      end
    end
  end
end
