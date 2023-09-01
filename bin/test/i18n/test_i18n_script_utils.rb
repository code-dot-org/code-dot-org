require_relative '../test_helper'
require_relative '../../i18n/i18n_script_utils'

class I18nScriptUtilsTest < Minitest::Test
  def test_crowdin_projects
    assert_equal %i[codeorg codeorg-markdown hour-of-code codeorg-restricted], CROWDIN_PROJECTS.keys
  end

  def test_to_crowdin_yaml
    assert_equal "---\n:en:\n  test: \"#example\"\n  'yes': 'y'\n", I18nScriptUtils.to_crowdin_yaml({en: {'test' => '#example', 'yes' => 'y'}})
  end

  def test_header_sanitization
    header = {'title' => 'Expects only title', 'invalid' => 'Unexpected header'}

    I18nScriptUtils.sanitize_header!(header)

    assert_equal({'title' => 'Expects only title'}, header)
  end

  def test_markdown_with_header_writing
    exec_seq = sequence('execution')

    expected_markdown = 'expected_markdown'
    expected_header   = {'expected' => 'header'}
    expected_filepath = 'expected_filepath'
    expected_file     = stub('expected_file')

    File.expects(:open).with(expected_filepath, 'w').yields(expected_file).in_sequence(exec_seq)
    I18nScriptUtils.expects(:to_crowdin_yaml).with(expected_header).returns('expected_header_crowdin_yaml').in_sequence(exec_seq)
    expected_file.expects(:write).with('expected_header_crowdin_yaml').in_sequence(exec_seq)
    expected_file.expects(:write).with("---\n\n").in_sequence(exec_seq)
    expected_file.expects(:write).with(expected_markdown).in_sequence(exec_seq)

    I18nScriptUtils.write_markdown_with_header(expected_markdown, expected_header, expected_filepath)
  end

  def test_markdown_with_header_writing_when_header_is_empty
    exec_seq = sequence('execution')

    expected_markdown = 'expected_markdown'
    expected_header   = {}
    expected_filepath = 'expected_filepath'
    expected_file     = stub('expected_file')

    File.expects(:open).with(expected_filepath, 'w').yields(expected_file).in_sequence(exec_seq)
    I18nScriptUtils.expects(:to_crowdin_yaml).with(expected_header).never
    expected_file.expects(:write).with("---\n\n").never
    expected_file.expects(:write).with(expected_markdown).in_sequence(exec_seq)

    I18nScriptUtils.write_markdown_with_header(expected_markdown, expected_header, expected_filepath)
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
  PegasusLanguages = Class.new

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

  describe '.delete_empty_crowdin_locale_dir' do
    let(:crowdin_locale) {'expected_crowdin_locale'}
    let(:crowdin_locale_dir_path) {CDO.dir(File.join('i18n/locales', crowdin_locale))}

    before do
      FileUtils.mkdir_p(crowdin_locale_dir_path)
    end

    context 'when Crowdin locale dir is empty' do
      it 'deletes the Crowdin locale dir' do
        assert File.directory?(crowdin_locale_dir_path)

        I18nScriptUtils.delete_empty_crowdin_locale_dir(crowdin_locale)

        refute File.directory?(crowdin_locale_dir_path)
      end
    end

    context 'when Crowdin locale dir is not empty' do
      before do
        FileUtils.touch(File.join(crowdin_locale_dir_path, 'test.txt'))
      end

      it 'does not delete the Crowdin locale dir' do
        I18nScriptUtils.delete_empty_crowdin_locale_dir(crowdin_locale)

        assert File.directory?(crowdin_locale_dir_path)
      end
    end
  end
end
