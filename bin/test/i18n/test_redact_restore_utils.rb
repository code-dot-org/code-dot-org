require_relative '../test_helper'
require_relative '../../i18n/redact_restore_utils'

describe RedactRestoreUtils do
  let(:described_class) {RedactRestoreUtils}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  describe '.redact_file' do
    let(:redact_file) {described_class.redact_file(source_path, plugins, format)}

    let(:source_path) {'expected_source_path'}
    let(:plugins) {['expected_plugins']}
    let(:format) {'expected_format'}
    let(:shellwords_escaped_source_path) {'shellwords_escaped_source_path'}

    before do
      Shellwords.stubs(:escape).with(source_path).returns(shellwords_escaped_source_path)
    end

    it 'redacts the source file' do
      expected_args =
        "#{CDO.dir('bin/i18n/node_modules/.bin/redact')} " \
          "-p #{CDO.dir("bin/i18n/node_modules/@code-dot-org/remark-plugins/src/#{plugins.first}.js")} " \
          "-f #{format} " \
          "#{shellwords_escaped_source_path}"
      expected_stdout = 'expected_stdout'

      Open3.expects(:capture2).with(expected_args).returns([expected_stdout])

      assert_equal expected_stdout, redact_file
    end

    context 'when no plugins are provided' do
      let(:plugins) {[]}

      it 'redacts the source file without plugins' do
        expected_args = "#{CDO.dir('bin/i18n/node_modules/.bin/redact')} -f #{format} #{shellwords_escaped_source_path}"
        expected_stdout = 'expected_stdout'

        Open3.expects(:capture2).with(expected_args).returns([expected_stdout])

        assert_equal expected_stdout, redact_file
      end
    end
  end

  describe '.restore_file' do
    let(:restore_file) {described_class.restore_file(source_path, redacted_path, plugins, format)}

    let(:source_path) {'expected_source_path'}
    let(:redacted_path) {'expected_redacted_path'}
    let(:plugins) {['expected_plugins']}
    let(:format) {'expected_format'}

    let(:shellwords_escaped_source_path) {'shellwords_escaped_source_path'}
    let(:shellwords_escaped_redacted_path) {'shellwords_escaped_redacted_path'}

    before do
      Shellwords.stubs(:escape).with(source_path).returns(shellwords_escaped_source_path)
      Shellwords.stubs(:escape).with(redacted_path).returns(shellwords_escaped_redacted_path)
    end

    it 'restores the source file' do
      expected_args =
        "#{CDO.dir('bin/i18n/node_modules/.bin/restore')} " \
          "-p #{CDO.dir("bin/i18n/node_modules/@code-dot-org/remark-plugins/src/#{plugins.first}.js")} " \
          "-f #{format} " \
          "-s #{shellwords_escaped_source_path} " \
          "-r #{shellwords_escaped_redacted_path}"
      expected_stdout = 'expected_stdout'

      Open3.expects(:capture2).with(expected_args).returns([expected_stdout])

      assert_equal expected_stdout, restore_file
    end

    context 'when no plugins are provided' do
      let(:plugins) {[]}

      it 'restores the source file without plugins' do
        expected_args =
          "#{CDO.dir('bin/i18n/node_modules/.bin/restore')} " \
          "-f #{format} " \
          "-s #{shellwords_escaped_source_path} " \
          "-r #{shellwords_escaped_redacted_path}"
        expected_stdout = 'expected_stdout'

        Open3.expects(:capture2).with(expected_args).returns([expected_stdout])

        assert_equal expected_stdout, restore_file
      end
    end
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

  describe '.restore_data' do
    let(:restore_data) {described_class.restore_data(source_data, redacted_data, plugins, format)}

    let(:source_data) {'expected_source_data'}
    let(:redacted_data) {'expected_redacted_data'}
    let(:plugins) {['expected_plugins']}
    let(:format) {'expected_format'}

    let(:tmp_source_file) {File.open('tmp_source.json', 'w')}
    let(:tmp_redacted_file) {File.open('tmp_redacted.json', 'w')}

    before do
      Tempfile.stubs(:new).with(%w[source .json]).returns(tmp_source_file)
      Tempfile.stubs(:new).with(%w[redacted .json]).returns(tmp_redacted_file)
    end

    it 'restores the data' do
      expected_restored_data = 'expected_restored_data'

      RedactRestoreUtils.expects(:restore_file).with(tmp_source_file.path, tmp_redacted_file.path, plugins, format).returns(JSON.generate(expected_restored_data))

      assert_equal expected_restored_data, restore_data
      assert_equal source_data, JSON.load_file(tmp_source_file)
      assert_equal redacted_data, JSON.load_file(tmp_redacted_file)
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

      context 'when no plugins are provided' do
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

      context 'when no plugins are provided' do
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

  describe '.restore' do
    let(:restore) {described_class.restore(source_file_path, redacted_file_path, target_file_path, plugins, format)}

    let(:source_file_path) {'expected_source_file_path'}
    let(:redacted_file_path) {'expected_redacted_file_path'}
    let(:target_file_path) {'restored_file_path'}
    let(:plugins) {['expected_plugin']}
    let(:format) {'expected_format'}

    let(:source_file_data) {{'en' => 'source_i18n_data'}}
    let(:redacted_file_data) {{'uk' => 'redacted_i18n_data'}}
    let(:source_data) {source_file_data}
    let(:restored_data) {'expected_restored_data'}

    let(:target_file_is_json) {false}
    let(:target_file_is_yaml) {false}

    let(:expect_redacted_data_restoration) do
      RedactRestoreUtils.expects(:restore_data).with(source_data, redacted_file_data, plugins, format).returns(restored_data)
    end

    before do
      FileUtils.touch(source_file_path)
      FileUtils.touch(redacted_file_path)

      I18nScriptUtils.stubs(:parse_file).with(source_file_path).returns(source_file_data)
      I18nScriptUtils.stubs(:parse_file).with(redacted_file_path).returns(redacted_file_data)

      I18nScriptUtils.stubs(:json_file?).with(target_file_path).returns(target_file_is_json)
      I18nScriptUtils.stubs(:yaml_file?).with(target_file_path).returns(target_file_is_yaml)

      RedactRestoreUtils.expects(:restore_data).never
      I18nScriptUtils.expects(:write_json_file).never
      I18nScriptUtils.expects(:write_yaml_file).never
    end

    it 'raises error "unknown target file format"' do
      actual_error = assert_raises {restore}
      assert_equal "[#{target_file_path}] unknown target file format", actual_error.message
    end

    context 'when target file is json' do
      let(:target_file_is_json) {true}

      let(:expect_restored_data_to_target_file_writing) do
        I18nScriptUtils.expects(:write_json_file).with(target_file_path, restored_data)
      end

      it 'restores the data into the target json file' do
        expect_redacted_data_restoration.once
        expect_restored_data_to_target_file_writing.once

        restore
      end

      context 'if no plugins are provided' do
        let(:restore) {described_class.restore(source_file_path, redacted_file_path, target_file_path)}

        let(:plugins) {[]}
        let(:format) {anything}
        let(:restored_data) {'restored_data_without_plugins'}

        it 'restores the data without plugins' do
          expect_redacted_data_restoration.once
          expect_restored_data_to_target_file_writing.once

          restore
        end
      end

      context 'if format is not provided' do
        let(:restore) {described_class.restore(source_file_path, redacted_file_path, target_file_path, plugins)}

        let(:format) {'md'}
        let(:restored_data) {'restored_data_using_md_format'}

        it 'restores the data using "md" format' do
          expect_redacted_data_restoration.once
          expect_restored_data_to_target_file_writing.once

          restore
        end
      end
    end

    context 'when target file is yaml' do
      let(:target_file_is_yaml) {true}

      let(:source_data) {{'uk' => 'source_i18n_data'}}

      let(:expect_restored_data_to_target_file_writing) do
        I18nScriptUtils.expects(:write_yaml_file).with(target_file_path, restored_data)
      end

      it 'restores the data into the target yaml file' do
        expect_redacted_data_restoration.once
        expect_restored_data_to_target_file_writing.once

        restore
      end

      context 'if source data contains more then one key' do
        let(:source_file_data) {{'key1' => 'val2', 'key2' => 'val2'}}

        let(:source_data) {source_file_data}
        let(:restored_data) {'expected_restored_data_without_source_data_root_key_changing'}

        it 'restores the data without source data root key changing' do
          expect_redacted_data_restoration.once
          expect_restored_data_to_target_file_writing.once

          restore
        end
      end
    end

    context 'when source file does not exist' do
      before do
        FileUtils.rm(source_file_path)
      end

      it 'raises error "source file does not exist"' do
        actual_error = assert_raises {restore}
        assert_equal "[#{source_file_path}] source file does not exist", actual_error.message
      end
    end

    context 'when redacted file does not exist' do
      before do
        FileUtils.rm(redacted_file_path)
      end

      it 'raises error "redacted file does not exist"' do
        actual_error = assert_raises {restore}
        assert_equal "[#{redacted_file_path}] redacted file does not exist", actual_error.message
      end
    end

    context 'when source data does not exist' do
      let(:source_file_data) {nil}

      it 'raises error "source data does not exist"' do
        expect_redacted_data_restoration.never

        actual_error = assert_raises {restore}

        assert_equal "[#{source_file_path}] source data does not exist", actual_error.message
      end
    end

    context 'when redacted data does not exist' do
      let(:redacted_file_data) {nil}

      it 'does not restore the data' do
        expect_redacted_data_restoration.never
        restore
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

    context 'when no plugins are provided' do
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

  describe '.restore_markdown' do
    let(:restore_markdown) {described_class.restore_markdown(source_file_path, redacted_file_path, target_file_path, plugins, format)}

    let(:source_file_path) {'expected_source_file.md'}
    let(:redacted_file_path) {'expected_redacted_file.md'}
    let(:target_file_path) {'expected_target_file.md'}
    let(:plugins) {['expected_plugin']}
    let(:format) {'expected_format'}

    let(:restored_data) {'expected_restored_data'}

    let(:expect_restored_data_to_target_file_writing) do
      I18nScriptUtils.expects(:write_file).with(target_file_path, restored_data)
    end

    before do
      FileUtils.touch(source_file_path)
      FileUtils.touch(redacted_file_path)

      described_class.stubs(:restore_file).with(source_file_path, redacted_file_path, plugins, format).returns(restored_data)
    end

    it 'writes restored md data to the target file' do
      expect_restored_data_to_target_file_writing.once
      restore_markdown
    end

    context 'when the source file does not exist' do
      before do
        FileUtils.rm(source_file_path)
      end

      it 'does not write restored data to the target file' do
        expect_restored_data_to_target_file_writing.never
        restore_markdown
      end
    end

    context 'when the redacted file does not exist' do
      before do
        FileUtils.rm(redacted_file_path)
      end

      it 'does not write restored data to the target file' do
        expect_restored_data_to_target_file_writing.never
        restore_markdown
      end
    end

    context 'when the source file is not .md' do
      let(:source_file_path) {'expected_source_file.not_md'}

      it 'does not write restored data to the target file' do
        expect_restored_data_to_target_file_writing.never
        restore_markdown
      end
    end

    context 'when no plugins are provided' do
      let(:redact_markdown) {described_class.restore_markdown(source_file_path, redacted_file_path, target_file_path)}

      let(:plugins) {[]}
      let(:format) {anything}
      let(:redacted_data) {'restored_without_plugins_data'}

      it 'writes redacted without plugins data to the target file' do
        expect_restored_data_to_target_file_writing.once
        restore_markdown
      end
    end

    context 'when format is not provided' do
      let(:redact_markdown) {described_class.restore_markdown(source_file_path, redacted_file_path, target_file_path, plugins)}

      let(:format) {'md'}
      let(:redacted_data) {'restored_with_md_format_data'}

      it 'writes redacted with md format data to the target file' do
        expect_restored_data_to_target_file_writing.once
        restore_markdown
      end
    end
  end
end
