require_relative '../test_helper'
require_relative '../../i18n/redact_restore_utils'
require_relative '../../i18n/i18n_script_utils'

describe RedactRestoreUtils do
  let(:described_class) {RedactRestoreUtils}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  describe '.redact_data' do
    let(:redact_data) {described_class.redact_data(source_data, plugins, format)}

    let(:source_data) {'expected_source_data'}
    let(:plugins) {['expected_plugins']}
    let(:format) {'expected_format'}

    it 'redacts the data' do
      expected_args =
        "#{CDO.dir('bin/i18n/node_modules/.bin/redact')} " \
        "-p #{CDO.dir("bin/i18n/node_modules/@code-dot-org/remark-plugins/src/#{plugins.first}.js")} " \
        "-f #{format}"
      expected_stdin_data = JSON.generate(source_data)
      redacted_data = 'expected_redacted_data'

      Open3.expects(:capture2).with(expected_args, stdin_data: expected_stdin_data).returns([JSON.generate(redacted_data)])

      assert_equal redacted_data, redact_data
    end

    context 'when no plugins are provided' do
      let(:plugins) {[]}

      it 'redacts the data without plugins' do
        expected_args = "#{CDO.dir('bin/i18n/node_modules/.bin/redact')} -f #{format}"
        expected_stdin_data = JSON.generate(source_data)
        redacted_data = 'expected_redacted_data'

        Open3.expects(:capture2).with(expected_args, stdin_data: expected_stdin_data).returns([JSON.generate(redacted_data)])

        assert_equal redacted_data, redact_data
      end
    end

    describe 'plugin testing' do
      let(:format) {'md'}

      let(:perform_plugin_testing) do
        assert_equal({'test' => expected_result}, described_class.redact_data({'test' => redactable_data}, [plugin], format))
      end

      context 'when plugin is blockfield' do
        let(:plugin) {'blockfield'}
        let(:format) {'txt'}

        let(:redactable_data) {"{TEST} \n {EXAMPLE}"}
        let(:expected_result) {"[TEST][0] \n [EXAMPLE][1]"}

        it 'returns correct redacted data', &proc {perform_plugin_testing}
      end

      context 'when plugin is visualCodeBlock' do
        let(:plugin) {'visualCodeBlock'}

        let(:redactable_data) {"\r\n - *test* - \n"}
        let(:expected_result) {"-   _test_ - "}

        it 'returns correct redacted data', &proc {perform_plugin_testing}
      end

      context 'when plugin is link' do
        let(:plugin) {'link'}

        let(:redactable_data) {'[link](https://example.org)'}
        let(:expected_result) {'[link][0]'}

        it 'returns correct redacted data', &proc {perform_plugin_testing}
      end

      context 'when plugin is resourceLink' do
        let(:plugin) {'resourceLink'}

        let(:redactable_data) {'[r test/example/1]'}
        let(:expected_result) {'[test][0]'}

        it 'returns correct redacted data', &proc {perform_plugin_testing}
      end

      context 'when plugin is vocabularyDefinition' do
        let(:plugin) {'vocabularyDefinition'}

        let(:redactable_data) {'[v test/example/1]'}
        let(:expected_result) {'[test][0]'}

        it 'returns correct redacted data', &proc {perform_plugin_testing}
      end

      context 'when plugin is blockly' do
        let(:plugin) {'blockly'}

        let(:redactable_data) {'<xml><block>block_content</block></xml>'}
        let(:expected_result) {'[blockly block][0]'}

        it 'returns correct redacted data', &proc {perform_plugin_testing}
      end
    end
  end

  describe '.redact' do
    let(:redact) {described_class.redact(source_file_path, target_file_path, plugins, format)}

    let(:source_file_path) {'expected_source_file_path'}
    let(:target_file_path) {'target_file_path'}
    let(:plugins) {['expected_plugin']}
    let(:format) {'expected_format'}

    let(:source_data) {'expected_source_data'}
    let(:redacted_data) {'expected_redacted_data'}

    let(:source_file_is_json) {false}
    let(:source_file_is_yaml) {false}

    let(:expect_redacted_data_to_json_file_writing) do
      I18nScriptUtils.expects(:write_json_file).with(target_file_path, redacted_data)
    end
    let(:expect_redacted_data_to_yaml_file_writing) do
      I18nScriptUtils.expects(:write_yaml_file).with(target_file_path, redacted_data)
    end

    before do
      FileUtils.touch(source_file_path)

      I18nScriptUtils.stubs(:json_file?).with(source_file_path).returns(source_file_is_json)
      I18nScriptUtils.stubs(:yaml_file?).with(source_file_path).returns(source_file_is_yaml)

      I18nScriptUtils.stubs(:parse_file).with(source_file_path).returns(source_data)
      RedactRestoreUtils.stubs(:redact_data).with(source_data, plugins, format).returns(redacted_data)

      I18nScriptUtils.stubs(:write_json_file).with(target_file_path, redacted_data)
      I18nScriptUtils.stubs(:write_yaml_file).with(target_file_path, redacted_data)
    end

    describe 'json source file' do
      let(:source_file_is_json) {true}

      it 'writes redacted data to the target file' do
        expect_redacted_data_to_json_file_writing.once
        redact
      end

      context 'when the source file does not exist' do
        before do
          FileUtils.rm(source_file_path)
        end

        it 'does not write redacted data to the target file' do
          expect_redacted_data_to_json_file_writing.never
          redact
        end
      end

      context 'when plugins are not provided' do
        let(:redact) {described_class.redact(source_file_path, target_file_path)}

        let(:plugins) {[]}
        let(:format) {anything}
        let(:redacted_data) {'redacted_without_plugins_data'}

        it 'writes redacted without plugins data to the target file' do
          expect_redacted_data_to_json_file_writing.once
          redact
        end
      end

      context 'when format is not provided' do
        let(:redact) {described_class.redact(source_file_path, target_file_path, plugins)}

        let(:format) {'md'}
        let(:redacted_data) {'redacted_md_data'}

        it 'writes redacted md data to the target file' do
          expect_redacted_data_to_json_file_writing.once
          redact
        end
      end
    end

    describe 'yaml source file' do
      let(:source_file_is_yaml) {true}

      it 'writes redacted data to the target file' do
        expect_redacted_data_to_yaml_file_writing.once
        redact
      end

      context 'when the source file does not exist' do
        before do
          FileUtils.rm(source_file_path)
        end

        it 'does not write redacted data to the target file' do
          expect_redacted_data_to_yaml_file_writing.never
          redact
        end
      end

      context 'when plugins are not provided' do
        let(:redact) {described_class.redact(source_file_path, target_file_path)}

        let(:plugins) {[]}
        let(:format) {anything}
        let(:redacted_data) {'redacted_without_plugins_data'}

        it 'writes redacted without plugins data to the target file' do
          expect_redacted_data_to_yaml_file_writing.once
          redact
        end
      end

      context 'when format is not provided' do
        let(:redact) {described_class.redact(source_file_path, target_file_path, plugins)}

        let(:format) {'md'}
        let(:redacted_data) {'redacted_md_data'}

        it 'writes redacted md data to the target file' do
          expect_redacted_data_to_yaml_file_writing.once
          redact
        end
      end
    end
  end

  describe '.redact_markdown' do
    let(:redact_markdown) {described_class.redact_markdown(source_file_path, target_file_path, plugins, format)}

    let(:source_file_path) {'expected_source_file.md'}
    let(:target_file_path) {'expected_target_file.md'}
    let(:plugins) {['expected_plugin']}
    let(:format) {'expected_format'}

    let(:redacted_data) {'expected_redacted_data'}

    let(:expect_redacted_data_to_target_file_writing) do
      I18nScriptUtils.expects(:write_file).with(target_file_path, redacted_data)
    end

    before do
      FileUtils.touch(source_file_path)

      described_class.stubs(:redact_file).with(source_file_path, plugins, format).returns(redacted_data)
    end

    it 'writes redacted md data to the target file' do
      expect_redacted_data_to_target_file_writing.once
      redact_markdown
    end

    context 'when the source file does not exist' do
      before do
        FileUtils.rm(source_file_path)
      end

      it 'does not write redacted data to the target file' do
        expect_redacted_data_to_target_file_writing.never
        redact_markdown
      end
    end

    context 'when the source file is not .md' do
      let(:source_file_path) {'expected_source_file.not_md'}

      it 'does not write redacted data to the target file' do
        expect_redacted_data_to_target_file_writing.never
        redact_markdown
      end
    end

    context 'when plugins are not provided' do
      let(:redact_markdown) {described_class.redact_markdown(source_file_path, target_file_path)}

      let(:plugins) {[]}
      let(:format) {anything}
      let(:redacted_data) {'redacted_without_plugins_data'}

      it 'writes redacted without plugins data to the target file' do
        expect_redacted_data_to_target_file_writing.once
        redact_markdown
      end
    end

    context 'when format is not provided' do
      let(:redact_markdown) {described_class.redact_markdown(source_file_path, target_file_path, plugins)}

      let(:format) {'md'}
      let(:redacted_data) {'redacted_with_md_format_data'}

      it 'writes redacted with md format data to the target file' do
        expect_redacted_data_to_target_file_writing.once
        redact_markdown
      end
    end
  end
end
