require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/markdown/sync_in'

describe I18n::Resources::Pegasus::Markdown::SyncIn do
  let(:described_class) {I18n::Resources::Pegasus::Markdown::SyncIn}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  before do
    I18n::Utils::PegasusMarkdown.stubs(:sanitize_file_header)
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    assert_equal I18n::Utils::SyncInBase, described_class.superclass
  end

  describe '#process' do
    let(:process) {described_instance.process}

    before do
      FileUtils.mkdir_p(File.dirname(origin_markdown_file_path))
      FileUtils.touch(origin_markdown_file_path)
    end

    context 'when the origin markdown file is public .md' do
      let(:origin_markdown_file_subpath) {'public/test.md'}
      let(:origin_markdown_file_path) {CDO.dir('pegasus/sites.v3/code.org', origin_markdown_file_subpath)}

      it 'prepares i18n source file' do
        I18n::Resources::Pegasus::Markdown::SyncIn.stub_const(:LOCALIZABLE_FILE_SUBPATHS, [origin_markdown_file_subpath]) do
          execution_sequence = sequence('execution')
          expected_i18n_source_file_path = CDO.dir('i18n/locales/source/markdown/public/test.md')

          I18nScriptUtils.expects(:copy_file).with(origin_markdown_file_path, expected_i18n_source_file_path).in_sequence(execution_sequence)
          I18n::Utils::PegasusMarkdown.expects(:sanitize_file_header).with(expected_i18n_source_file_path).in_sequence(execution_sequence)

          process
        end
      end
    end

    context 'when the origin markdown file is views .md.partial' do
      let(:origin_markdown_file_subpath) {'views/test.md.partial'}
      let(:origin_markdown_file_path) {CDO.dir('pegasus/sites.v3/code.org', origin_markdown_file_subpath)}

      it 'prepares i18n source file' do
        I18n::Resources::Pegasus::Markdown::SyncIn.stub_const(:LOCALIZABLE_FILE_SUBPATHS, [origin_markdown_file_subpath]) do
          execution_sequence = sequence('execution')
          expected_i18n_source_path = CDO.dir('i18n/locales/source/markdown/public/views/test.md')

          I18nScriptUtils.expects(:copy_file).with(origin_markdown_file_path, expected_i18n_source_path).in_sequence(execution_sequence)
          I18n::Utils::PegasusMarkdown.expects(:sanitize_file_header).with(expected_i18n_source_path).in_sequence(execution_sequence)

          process
        end
      end
    end
  end
end
