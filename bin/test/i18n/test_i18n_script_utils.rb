require_relative '../test_helper'
require_relative '../../i18n/i18n_script_utils'

class I18nScriptUtilsTest < Minitest::Test
  def test_crowdin_projects
    assert_equal %i[codeorg codeorg-markdown hour-of-code codeorg-restricted], CROWDIN_PROJECTS.keys
  end

  def test_to_crowdin_yaml
    assert_equal "---\n:en:\n  test: \"#example\"\n  'yes': 'y'\n", I18nScriptUtils.to_crowdin_yaml({en: {'test' => '#example', 'yes' => 'y'}})
  end

  def test_error_logging
    expected_error_class = 'expected_error_class'
    expected_error_message = 'expected_error_message'

    I18nScriptUtils.expects(:puts).with('[expected_error_class] expected_error_message').once

    I18nScriptUtils.log_error(expected_error_class, expected_error_message)
  end

  def test_unit_directory_changing
    exec_seq = sequence('execution')

    expected_content_dir         = CDO.dir('i18n/locales/source/expected_content_dir')
    expected_unit_i18n_filename  = 'expected_unit_i18n.json'
    expected_unit_i18n_filepath1 = CDO.dir('i18n/locales/source/expected_content_dir/1/expected_unit_i18n.json')
    expected_unit_i18n_filepath2 = CDO.dir('i18n/locales/source/expected_content_dir/2/expected_unit_i18n.json')

    Dir.expects(:glob).with(File.join(expected_content_dir, '**', expected_unit_i18n_filename)).in_sequence(exec_seq).returns([expected_unit_i18n_filepath2])
    I18nScriptUtils.expects(:log_error).with(
      'Destination directory for unit is attempting to change',
      'Unit expected_unit_i18n wants to output strings to 1/expected_unit_i18n.json, but 2/expected_unit_i18n.json already exists'
    ).in_sequence(exec_seq)

    assert I18nScriptUtils.unit_directory_change?(expected_content_dir, expected_unit_i18n_filename, expected_unit_i18n_filepath1)
  end

  def test_unit_directory_changing_when_no_matching_files
    expected_content_dir        = CDO.dir('i18n/locales/source/expected_content_dir')
    expected_unit_i18n_filename = 'expected_unit_i18n.json'
    expected_unit_i18n_filepath = CDO.dir('i18n/locales/source/expected_content_dir/expected_unit_i18n.json')

    Dir.expects(:glob).with(File.join(expected_content_dir, '**', expected_unit_i18n_filename)).once.returns([expected_unit_i18n_filepath])

    refute I18nScriptUtils.unit_directory_change?(expected_content_dir, expected_unit_i18n_filename, expected_unit_i18n_filepath)
  end

  def test_yml_file_fixing
    provided_yaml_file_path = 'provided_yaml_file_path'

    File.expects(:read).with(provided_yaml_file_path).returns("---\nen-US:\n  data\n")
    File.expects(:write).with(provided_yaml_file_path, %Q["en-US":\n  data\n])

    I18nScriptUtils.fix_yml_file(provided_yaml_file_path)
  end

  def test_to_js_locale_returns_formated_js_locale
    assert_equal 'en_us', I18nScriptUtils.to_js_locale('en-US')
  end
end

describe I18nScriptUtils do
  def around
    FakeFS.with_fresh {yield}
  end

  describe '.file_changed?' do
    before do
      I18nScriptUtils.remove_instance_variable(:@change_data) if I18nScriptUtils.instance_variable_get(:@change_data)
    end

    context 'when expected file is found by i18_locale' do
      it 'returns true' do
        expected_files_to_sync_out_json = 'expected/files_to_sync_out.json'

        I18nScriptUtils.stub_const(:CROWDIN_PROJECTS, {expected_project: {files_to_sync_out_json: expected_files_to_sync_out_json}}) do
          exec_seq = sequence('execution')

          expected_locale = 'expected_i18_locale'
          expected_file_path = '/expected/file.json'

          File.expects(:exist?).with(expected_files_to_sync_out_json).in_sequence(exec_seq).returns(true)
          JSON.expects(:load_file).with(expected_files_to_sync_out_json).in_sequence(exec_seq).returns({expected_locale => {expected_file_path => 'true'}})
          PegasusLanguages.expects(:get_code_by_locale).with(expected_locale).in_sequence(exec_seq).returns('unexpected_crowdin_locale')

          assert I18nScriptUtils.file_changed?(expected_locale, expected_file_path)
        end
      end
    end

    context 'when expected file is found by crowdin_locale' do
      it 'returns true' do
        expected_files_to_sync_out_json = 'expected/files_to_sync_out.json'

        I18nScriptUtils.stub_const(:CROWDIN_PROJECTS, {expected_project: {files_to_sync_out_json: expected_files_to_sync_out_json}}) do
          exec_seq = sequence('execution')

          expected_locale = 'expected_i18_locale'
          expected_crowdin_locale = 'expected_crowdin_locale'
          expected_file_path = '/expected/file.json'

          File.expects(:exist?).with(expected_files_to_sync_out_json).in_sequence(exec_seq).returns(true)
          JSON.expects(:load_file).with(expected_files_to_sync_out_json).in_sequence(exec_seq).returns({expected_crowdin_locale => {expected_file_path => 'true'}})
          PegasusLanguages.expects(:get_code_by_locale).with(expected_locale).in_sequence(exec_seq).returns(expected_crowdin_locale)

          assert I18nScriptUtils.file_changed?(expected_locale, expected_file_path)
        end
      end
    end

    context 'when expected file is not found' do
      it 'returns false' do
        expected_files_to_sync_out_json = 'expected/files_to_sync_out.json'

        I18nScriptUtils.stub_const(:CROWDIN_PROJECTS, {expected_project: {files_to_sync_out_json: expected_files_to_sync_out_json}}) do
          exec_seq = sequence('execution')

          expected_locale = 'expected_i18_locale'
          expected_file_path = '/expected/file.json'

          File.expects(:exist?).with(expected_files_to_sync_out_json).in_sequence(exec_seq).returns(true)
          JSON.expects(:load_file).with(expected_files_to_sync_out_json).in_sequence(exec_seq).returns({expected_locale => {'unexpected_file_path' => 'true'}})
          PegasusLanguages.expects(:get_code_by_locale).with(expected_locale).in_sequence(exec_seq).returns('unexpected_crowdin_locale')

          refute I18nScriptUtils.file_changed?(expected_locale, expected_file_path)
        end
      end
    end

    context 'when project :files_to_sync_out_json_file does not exist' do
      it 'raises error' do
        expected_files_to_sync_out_json = 'expected/files_to_sync_out.json'

        I18nScriptUtils.stub_const(:CROWDIN_PROJECTS, {expected_project: {files_to_sync_out_json: expected_files_to_sync_out_json}}) do
          expected_locale = 'expected_i18_locale'
          expected_file_path = '/expected/file.json'

          File.expects(:exist?).with(expected_files_to_sync_out_json).once.returns(false)
          JSON.expects(:load_file).with(expected_files_to_sync_out_json).never
          PegasusLanguages.expects(:get_code_by_locale).with(expected_locale).never

          actual_error = assert_raises(RuntimeError) {I18nScriptUtils.file_changed?(expected_locale, expected_file_path)}
          assert_match /File not found #{expected_files_to_sync_out_json}/, actual_error.message
        end
      end
    end
  end

  describe '.sort_and_sanitize' do
    it 'returns sorted and sanitized hash' do
      initial_hash_data = {
        hash: {2 => '2', 1 => '1'},
        empty_hash: {},
        array: [b: 'b', a: 'a'],
        empty_array: [],
        string: "\rstr\\r",
        empty_string: '',
        number: 0,
        null: nil
      }

      sorted_and_sanitized_hash_data = {
        array: [a: 'a', b: 'b'],
        empty_array: [],
        hash: {1 => '1', 2 => '2'},
        number: 0,
        string: "\rstr\r"
      }

      assert_equal sorted_and_sanitized_hash_data, I18nScriptUtils.sort_and_sanitize(initial_hash_data)
    end
  end

  describe '.sanitize_data_and_write' do
    let(:data) {{'expected' => 'data'}}
    let(:sorted_and_sanitized_data) {{'expected' => 'sorted_and_sanitized_data'}}

    before do
      I18nScriptUtils.expects(:sort_and_sanitize).with(data).once.returns(sorted_and_sanitized_data)
    end

    context 'when the dest file is .yaml' do
      let(:dest_path) {'/expected.yaml'}

      it 'creates the dest file with the data' do
        I18nScriptUtils.sanitize_data_and_write(data, dest_path)

        assert File.exist?(dest_path)

        assert_equal "---\nexpected: sorted_and_sanitized_data\n", File.read(dest_path)
      end
    end

    context 'when the dest file is .yml' do
      let(:dest_path) {'/expected.yml'}

      it 'creates the file with the data' do
        I18nScriptUtils.sanitize_data_and_write(data, dest_path)

        assert File.exist?(dest_path)

        assert_equal "---\nexpected: sorted_and_sanitized_data\n", File.read(dest_path)
      end
    end

    context 'when the dest file is .json' do
      let(:dest_path) {'/expected.json'}

      it 'creates the file with the data' do
        I18nScriptUtils.sanitize_data_and_write(data, dest_path)

        assert File.exist?(dest_path)

        assert_equal %Q[{\n  "expected": "sorted_and_sanitized_data"\n}], File.read(dest_path)
      end
    end

    context 'when the file is in unknown format' do
      let(:dest_path) {'/unexpected.txt'}

      it 'raises error' do
        actual_error = assert_raises {I18nScriptUtils.sanitize_data_and_write(data, dest_path)}

        refute File.exist?(dest_path)

        assert_equal 'do not know how to serialize localization data to /unexpected.txt', actual_error.message
      end
    end
  end

  describe '.parse_file' do
    subject {I18nScriptUtils.parse_file(file_path)}

    let(:file_path) {'/expected.txt'}
    let(:file_data) {{'expected' => 'data'}}
    let(:file_content) {file_data}

    before do
      File.write(file_path, file_content)
    end

    context 'when the file is .yaml' do
      let(:file_path) {'/expected.yaml'}
      let(:file_content) {YAML.dump(file_data)}

      it 'loads the file data' do
        assert_equal file_data, subject
      end
    end

    context 'when the file is .yml' do
      let(:file_path) {'/expected.yml'}
      let(:file_content) {YAML.dump(file_data)}

      it 'loads the file data' do
        assert_equal file_data, subject
      end
    end

    context 'when the file is .json' do
      let(:file_path) {'/expected.json'}
      let(:file_content) {JSON.dump(file_data)}

      it 'loads the file data' do
        assert_equal file_data, subject
      end
    end

    context 'when the file is unknown format' do
      let(:file_path) {'/unexpected.txt'}

      it 'raises error' do
        actual_error = assert_raises {subject}
        assert_equal 'do not know how to parse file "/unexpected.txt"', actual_error.message
      end
    end
  end

  describe '.rename_dir' do
    let(:from_dir) {'/from_dir'}
    let(:to_dir) {'/to_dir'}

    it 'renames directory' do
      FileUtils.mkdir_p(from_dir)
      File.write(File.join(from_dir, 'test1.txt'), 'new_data')

      I18nScriptUtils.rename_dir(from_dir, to_dir)

      refute File.exist?(from_dir)
      assert File.exist?(to_dir)
      assert_equal [File.join(to_dir, 'test1.txt')], Dir.glob(File.join(to_dir, '*'))
      assert_equal 'new_data', File.read(File.join(to_dir, 'test1.txt'))

      File.write(File.join(to_dir, 'test2.txt'), 'old_data')
      FileUtils.mkdir_p(from_dir)
      File.write(File.join(from_dir, 'test2.txt'), 'new_data')

      I18nScriptUtils.rename_dir(from_dir, to_dir)

      refute File.exist?(from_dir)
      assert_equal [File.join(to_dir, 'test1.txt'), File.join(to_dir, 'test2.txt')], Dir.glob(File.join(to_dir, '*'))
      assert_equal 'new_data', File.read(File.join(to_dir, 'test2.txt'))
    end
  end

  describe '.remove_empty_dir' do
    let(:dir) {'/expected_dir'}

    before do
      FileUtils.mkdir_p(dir)
    end

    context 'when Crowdin locale dir does not exist' do
      it 'does not raise the error "No such file or directory"' do
        I18nScriptUtils.remove_empty_dir('non/existent/dir')
      end
    end

    context 'when Crowdin locale dir is empty' do
      it 'removes the Crowdin locale dir' do
        assert File.directory?(dir)

        I18nScriptUtils.remove_empty_dir(dir)

        refute File.directory?(dir)
      end
    end

    context 'when Crowdin locale dir is not empty' do
      before do
        FileUtils.touch(File.join(dir, 'test.txt'))
      end

      it 'does not remove the Crowdin locale dir' do
        I18nScriptUtils.remove_empty_dir(dir)

        assert File.directory?(dir)
      end
    end
  end
end
