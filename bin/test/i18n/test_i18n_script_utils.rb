require_relative '../test_helper'
require_relative '../../i18n/i18n_script_utils'

describe I18nScriptUtils do
  let(:described_class) {I18nScriptUtils}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  describe '.crowdin_creds' do
    let(:crowdin_creds) {I18nScriptUtils.crowdin_creds}

    let(:crowdin_creds_file_path) {CDO.dir('bin/i18n/crowdin_credentials.yml')}
    let(:crowdin_creds_file_data) {{'api_token' => 'expected_api_token'}}

    before do
      FileUtils.mkdir_p File.dirname(crowdin_creds_file_path)
      File.write crowdin_creds_file_path, YAML.dump(crowdin_creds_file_data)
    end

    it 'returns crowdin_credentials.yml data' do
      _(crowdin_creds).must_equal crowdin_creds_file_data
    end
  end

  describe '.parse_options' do
    let(:parse_options) {described_class.parse_options}

    describe ':testing' do
      let(:option_testing) {parse_options[:testing]}

      it 'returns false by default' do
        _(option_testing).must_equal false
      end

      context 'when "-t" command line option is set' do
        before do
          ARGV << '-t'
        end

        it 'returns true' do
          _(option_testing).must_equal true
        end
      end

      context 'when "--testing" command line option is set' do
        before do
          ARGV << '--testing'
        end

        it 'returns true' do
          _(option_testing).must_equal true
        end
      end
    end
  end

  describe '.to_crowdin_yaml' do
    let(:to_crowdin_yaml) {described_class.to_crowdin_yaml(to_crowdin_yaml_data)}

    let(:to_crowdin_yaml_data) {{en: {'test' => '#example', 'yes' => 'y'}}}
    let(:to_crowdin_yaml_output) {"---\n:en:\n  test: \"#example\"\n  'yes': 'y'\n"}

    it 'returns correctly formatted yaml' do
      _(to_crowdin_yaml).must_equal to_crowdin_yaml_output
    end
  end

  describe '.unit_directory_change?' do
    let(:unit_directory_change?) {I18nScriptUtils.unit_directory_change?(content_dir, unit_i18n_filepath)}

    let(:content_dir) {CDO.dir('i18n/locales/source/expected_content_dir')}
    let(:unit_i18n_filename) {'expected_unit_i18n.json'}
    let(:unit_i18n_filepath) {File.join(content_dir, 'new_unit_dir', unit_i18n_filename)}

    before do
      I18nScriptUtils.stubs(:log_error)
    end

    it 'returns false' do
      I18nScriptUtils.expects(:log_error).never

      _(unit_directory_change?).must_equal false
    end

    context 'when the unit file already exists in another dir' do
      let(:old_unit_i18n_filepath) {File.join(content_dir, 'old_unit_dir', unit_i18n_filename)}

      before do
        FileUtils.mkdir_p File.dirname(old_unit_i18n_filepath)
        FileUtils.touch(old_unit_i18n_filepath)
      end

      it 'logs the error and returns true' do
        I18nScriptUtils.expects(:log_error).with(
          'Destination directory for unit is attempting to change',
          'Unit expected_unit_i18n wants to output strings to new_unit_dir/expected_unit_i18n.json, but old_unit_dir/expected_unit_i18n.json already exists'
        ).once

        _(unit_directory_change?).must_equal true
      end
    end
  end

  describe '.log_error' do
    let(:log_error) {described_class.log_error(error_class, error_message)}

    let(:error_class) {'expected_error_class'}
    let(:error_message) {'expected_error_message'}

    it 'returns error class and message' do
      described_class.expects(:puts).with('[expected_error_class] expected_error_message').once
      _(log_error)
    end
  end

  describe '.fix_yml_file' do
    let(:fix_yml_file) {described_class.fix_yml_file(provided_yaml_file_path)}

    let(:provided_yaml_file_path) {'provided_yaml_file_path'}
    let(:provided_yaml_file_data) {"---\nen-US:\n  data\n"}
    let(:expected_yaml_output) {%Q["en-US":\n  data\n]}

    before do
      FileUtils.mkdir_p File.dirname(provided_yaml_file_path)
      File.write provided_yaml_file_path, provided_yaml_file_data
    end

    it 'yml file should be reformatted correctly' do
      assert_changes -> {File.read(provided_yaml_file_path)}, from: provided_yaml_file_data, to: expected_yaml_output do
        fix_yml_file
      end
    end
  end

  describe '.to_js_locale' do
    let(:to_js_locale) {described_class.to_js_locale(locale)}

    let(:locale) {'en-US'}
    let(:expected_locale_string) {'en_us'}

    it 'locale string should be formatted correctly' do
      _(to_js_locale).must_equal expected_locale_string
    end
  end

  describe '.to_dashboard_i18n_struct' do
    let(:locale) {'expected_locale'}
    let(:type) {'expected_type'}
    let(:i18n_data) {'expected_i18n_data'}

    it 'returns correct Dashboard i18n file data structure' do
      assert_equal(
        {locale => {'data' => {type => i18n_data}}},
        I18nScriptUtils.to_dashboard_i18n_data(locale, type, i18n_data)
      )
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

  describe '.json_file?' do
    context 'when the file format is .json' do
      let(:file_path) {'test.json'}

      it 'returns true' do
        assert I18nScriptUtils.json_file?(file_path)
      end
    end

    context 'when the file format is not valid' do
      let(:file_path) {'test.yml'}

      it 'returns false' do
        refute I18nScriptUtils.json_file?(file_path)
      end
    end
  end

  describe '.yaml_file?' do
    context 'when the file format is .yml' do
      let(:file_path) {'test.yml'}

      it 'returns true' do
        assert I18nScriptUtils.yaml_file?(file_path)
      end
    end

    context 'when the file format is .yaml' do
      let(:file_path) {'test.yaml'}

      it 'returns true' do
        assert I18nScriptUtils.yaml_file?(file_path)
      end
    end

    context 'when the file format is not valid' do
      let(:file_path) {'test.json'}

      it 'returns false' do
        refute I18nScriptUtils.yaml_file?(file_path)
      end
    end
  end

  describe '.sanitize_data_and_write' do
    let(:data) {{'expected' => 'data'}}
    let(:sorted_and_sanitized_data) {{'expected' => 'sorted_and_sanitized_data'}}
    let(:dest_file_data) {File.read(dest_path)}

    before do
      I18nScriptUtils.expects(:sort_and_sanitize).with(data).once.returns(sorted_and_sanitized_data)
    end

    context 'when the dest file is .yaml' do
      let(:dest_path) {'/expected.yaml'}

      it 'creates the dest file with yaml data' do
        I18nScriptUtils.sanitize_data_and_write(data, dest_path)

        assert File.exist?(dest_path)
        assert_equal "---\nexpected: sorted_and_sanitized_data\n", dest_file_data
      end
    end

    context 'when the dest file is .yml' do
      let(:dest_path) {'/expected.yml'}

      it 'creates the file with yaml data' do
        I18nScriptUtils.sanitize_data_and_write(data, dest_path)

        assert File.exist?(dest_path)
        assert_equal "---\nexpected: sorted_and_sanitized_data\n", dest_file_data
      end
    end

    context 'when the dest file is .json' do
      let(:dest_path) {'/expected.json'}

      it 'creates the file with json data' do
        I18nScriptUtils.sanitize_data_and_write(data, dest_path)

        assert File.exist?(dest_path)
        assert_equal %Q[{\n  "expected": "sorted_and_sanitized_data"\n}], dest_file_data
      end
    end

    context 'when the file is in unknown format' do
      let(:dest_path) {'/unexpected.txt'}

      it 'creates the file with the data' do
        I18nScriptUtils.sanitize_data_and_write(data, dest_path)

        assert File.exist?(dest_path)
        assert_equal '{"expected"=>"sorted_and_sanitized_data"}', dest_file_data
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

  describe '.write_file' do
    let(:write_file) {I18nScriptUtils.write_file(file_path, content)}

    let(:file_path) {'/expected/file.txt'}
    let(:content) {'expected_file_content'}

    it 'creates the file with the content' do
      write_file

      assert File.exist?(file_path)
      assert_equal content, File.read(file_path)
    end

    context 'when the file exists' do
      before do
        FileUtils.mkdir_p(File.dirname(file_path))
        File.write(file_path, 'origin_file_content')
      end

      it 'rewrites the file content' do
        write_file

        assert File.exist?(file_path)
        assert_equal content, File.read(file_path)
      end
    end
  end

  describe '.write_json_file' do
    let(:write_json_file) {I18nScriptUtils.write_json_file(file_path, data)}

    let(:file_path) {'/expected/file.json'}
    let(:data) {{key: {key2: 'val'}}}

    it 'writes pretty json content to the file' do
      expected_file_content = <<~JSON.strip
        {
          "key": {
            "key2": "val"
          }
        }
      JSON

      write_json_file

      assert File.exist?(file_path)
      assert_equal expected_file_content, File.read(file_path)
    end
  end

  describe '.write_yaml_file' do
    let(:write_yaml_file) {I18nScriptUtils.write_yaml_file(file_path, data)}

    let(:file_path) {'/expected/file.yaml'}
    let(:data) {{key: {'key2' => 'val'}}}

    it 'writes pretty json content to the file' do
      expected_file_content = <<~YAML
        ---
        :key:
          key2: val
      YAML

      write_yaml_file

      assert File.exist?(file_path)
      assert_equal expected_file_content, File.read(file_path)
    end
  end

  describe '.copy_file' do
    let(:copy_file) {I18nScriptUtils.copy_file(file_path, dest_path)}

    let(:file_name) {'file.txt'}
    let(:file_path) {File.join('/origin/dir', file_name)}

    before do
      FileUtils.mkdir_p(File.dirname(file_path))
      FileUtils.touch(file_path)
    end

    context 'when the destination is a dir' do
      let(:dest_path) {'/dest/dir'}

      it 'copies the file to the dir' do
        copy_file
        assert File.exist?(File.join(dest_path, file_name))
      end
    end

    context 'when the destination is a file path' do
      let(:dest_path) {'/dest/dir/copy.txt'}

      it 'copies the file' do
        copy_file
        assert File.exist?(dest_path)
      end
    end
  end

  describe '.move_file' do
    let(:move_file) {I18nScriptUtils.move_file(file_path, dest_path)}

    let(:file_name) {'file.txt'}
    let(:file_path) {File.join('/origin/dir', file_name)}

    before do
      FileUtils.mkdir_p(File.dirname(file_path))
      FileUtils.touch(file_path)
    end

    context 'when the destination is a dir' do
      let(:dest_path) {'/dest/dir'}

      it 'moves the file to the dir' do
        move_file

        refute File.exist?(file_path)
        assert File.exist?(File.join(dest_path, file_name))
      end
    end

    context 'when the destination is a file path' do
      let(:dest_path) {'/dest/dir/copy.txt'}

      it 'moves the file' do
        move_file

        refute File.exist?(file_path)
        assert File.exist?(dest_path)
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

  describe '.crowdin_locale_dir' do
    let(:crowdin_locale_dir) {I18nScriptUtils.crowdin_locale_dir(locale, subdir, file_path)}

    let(:locale) {'uk-UA'}
    let(:subdir) {nil}
    let(:file_path) {'expected_file.json'}

    it 'returns the correct Crowdin translation file path' do
      _(crowdin_locale_dir).must_equal CDO.dir('i18n/crowdin', locale, file_path)
    end
  end
end
