require_relative '../../test_helper'
require_relative '../../../i18n/utils/pegasus_markdown'

describe I18n::Utils::PegasusMarkdown do
  class I18n::Utils::PegasusMarkdown::Documents; end

  let(:pegasus_documents_helper) {stub}

  def around
    FakeFS.with_fresh {yield}
  end

  before do
    I18n::Utils::PegasusMarkdown::Documents.stubs(new: stub(helpers: pegasus_documents_helper))
  end

  describe '.write_to' do
    let(:write_to_file) {I18n::Utils::PegasusMarkdown.write_to(file_path, header, markdown)}

    let(:header) {{'expected' => 'header'}}
    let(:markdown) {'expected_markdown_content'}
    let(:file_path) {'expected/file.md'}

    before do
      I18nScriptUtils.stubs(:to_crowdin_yaml)
    end

    it 'creates a markdown file with provided header and markdown content' do
      I18nScriptUtils.expects(:to_crowdin_yaml).with(header).once.returns('expected_crowdin_yaml_header')

      write_to_file

      assert File.exist?(file_path)
      assert_equal "expected_crowdin_yaml_header---\n\nexpected_markdown_content", File.read(file_path)
    end

    context 'when the header is empty' do
      let(:header) {{}}

      it 'creates a markdown file without header and with provided markdown content' do
        I18nScriptUtils.expects(:to_crowdin_yaml).never

        write_to_file

        assert File.exist?(file_path)
        assert_equal 'expected_markdown_content', File.read(file_path)
      end
    end
  end

  describe '.sanitize_header' do
    subject {I18n::Utils::PegasusMarkdown.sanitize_header(markdown_header)}

    let(:markdown_header) {{'title' => 'Expects only title', 'invalid' => 'Unexpected header'}}

    it 'returns hash with only the `title` key' do
      assert_equal({'title' => 'Expects only title'}, subject)
    end
  end

  describe '.sanitize_file_header' do
    let(:sanitize_file_header) {I18n::Utils::PegasusMarkdown.sanitize_file_header(file_path)}

    let(:file_path) {'expected/file.md'}

    it 'sanitizes the file header' do
      expected_header = 'expected_header'
      expected_content = 'expected_content'
      expected_sanitized_header = 'expected_sanitized_header'

      pegasus_documents_helper.expects(:parse_yaml_header).with(file_path).once.returns([expected_header, expected_content])
      I18n::Utils::PegasusMarkdown.expects(:sanitize_header).with(expected_header).once.returns(expected_sanitized_header)
      I18n::Utils::PegasusMarkdown.expects(:write_to).with(file_path, expected_sanitized_header, expected_content).once

      sanitize_file_header
    end
  end

  describe '.restore_file_header' do
    let(:restore_file_header) {I18n::Utils::PegasusMarkdown.restore_file_header(origin_file_path, target_file_path)}

    let(:origin_file_path) {'origin/file.md'}
    let(:target_file_path) {'target/file.md'}

    it 'restores the sanitized file header' do
      execution_sequence = sequence('execution')

      expected_origin_header = {expected_header1: 'origin_header1', expected_header2: 'origin_header2'}
      expected_target_header = 'expected_target_header'
      expected_target_content = 'expected_target_content'
      sanitized_target_header = {expected_header2: 'sanitized_target_header'}

      pegasus_documents_helper.expects(:parse_yaml_header).with(origin_file_path).in_sequence(execution_sequence).returns([expected_origin_header])
      pegasus_documents_helper.expects(:parse_yaml_header).with(target_file_path).in_sequence(execution_sequence).returns([expected_target_header, expected_target_content])

      I18n::Utils::PegasusMarkdown.expects(:sanitize_header).with(expected_target_header).in_sequence(execution_sequence).returns(sanitized_target_header)
      I18n::Utils::PegasusMarkdown.expects(:write_to).with(
        target_file_path, {expected_header1: 'origin_header1', **sanitized_target_header}, expected_target_content
      ).in_sequence(execution_sequence)

      restore_file_header
    end
  end
end
