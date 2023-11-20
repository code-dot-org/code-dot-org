require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/hourofcode/sync_in'

describe I18n::Resources::Pegasus::HourOfCode::SyncIn do
  let(:described_class) {I18n::Resources::Pegasus::HourOfCode::SyncIn}
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

    context 'when the file containing developer-added strings exists' do
      let(:hoc_origin_i18n_file_path) {CDO.dir('pegasus/sites.v3/hourofcode.com/i18n/en.yml')}
      let(:i18n_source_hoc_origin_i18n_file_path) {CDO.dir('i18n/locales/source/hourofcode/en.yml')}

      before do
        FileUtils.mkdir_p(File.dirname(hoc_origin_i18n_file_path))
        FileUtils.touch(hoc_origin_i18n_file_path)
      end

      it 'copies the file to the i18n source dir' do
        process
        assert File.exist?(i18n_source_hoc_origin_i18n_file_path)
      end
    end

    context 'when a Pegasus hourofcode markdown files exist' do
      let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/hourofcode/expected/test.md')}

      let(:expect_hoc_markdown_file_to_i18n_source_dir_copying) do
        I18nScriptUtils.expects(:copy_file).with(hoc_markdown_file_path, i18n_source_file_path)
      end
      let(:expect_i18n_source_file_header_sanitizing) do
        I18n::Utils::PegasusMarkdown.expects(:sanitize_file_header).with(i18n_source_file_path)
      end

      before do
        FileUtils.mkdir_p(File.dirname(hoc_markdown_file_path))
        FileUtils.touch(hoc_markdown_file_path)
      end

      [
        CDO.dir('pegasus/sites.v3/hourofcode.com/public/expected/test.md'),
        CDO.dir('pegasus/sites.v3/hourofcode.com/public/expected/test.md.partial'),
      ].each do |hoc_markdown_file_path|
        context "when the file is `#{File.extname(hoc_markdown_file_path)}`" do
          let(:hoc_markdown_file_path) {hoc_markdown_file_path}

          it 'prepares the i18n source file' do
            execution_sequence = sequence('execution')

            expect_hoc_markdown_file_to_i18n_source_dir_copying.in_sequence(execution_sequence)
            expect_i18n_source_file_header_sanitizing.in_sequence(execution_sequence)

            process
          end
        end
      end
    end
  end
end
