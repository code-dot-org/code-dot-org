require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/courses/sync_in'

describe I18n::Resources::Dashboard::Courses::SyncIn do
  let(:described_class) {I18n::Resources::Dashboard::Courses::SyncIn}
  let(:described_instance) {described_class.new}

  let(:origin_i18n_file_path) {CDO.dir('dashboard/config/locales/courses.en.yml')}
  let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/dashboard/courses.yml')}
  let(:i18n_backup_file_path) {CDO.dir('i18n/locales/original/dashboard/courses.yml')}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    assert_equal I18n::Utils::SyncInBase, described_class.superclass
  end

  describe '.perform' do
    before do
      I18n::Metrics.stubs(:report_runtime).yields(nil)
    end

    it 'preparse and then redacts the i18n source files' do
      execution_sequence = sequence('execution')

      described_class.any_instance.expects(:prepare).in_sequence(execution_sequence)
      described_class.any_instance.expects(:redact).in_sequence(execution_sequence)

      described_class.perform
    end
  end

  describe '#resources_i18n_data' do
    let(:resources_i18n_data) {described_instance.send(:resources_i18n_data)}

    let(:origin_course_i18n_file_path) {CDO.dir('dashboard/config/courses/test.course')}
    let(:property_family_name) {'csd'}
    let(:origin_course_i18n_file_data) do
      {
        'resources' => [
          'key'  => 'expected_resource_key',
          'url'  => 'expected_resource_url',
          'name' => 'expected_resource_name',
        ],
        'properties' => {
          'family_name'  => property_family_name,
          'version_year' => 'expected_property_version_year',
        }
      }
    end

    before do
      FileUtils.mkdir_p File.dirname(origin_course_i18n_file_path)
      File.write origin_course_i18n_file_path, JSON.dump(origin_course_i18n_file_data)
    end

    it 'returns i18n data of courses' do
      expected_resources_i18n_data = {
        'expected_resource_key/csd/expected_property_version_year' => {
          'name' => 'expected_resource_name',
          'url'  => 'expected_resource_url',
        }
      }

      assert_equal expected_resources_i18n_data, resources_i18n_data
    end

    context 'when the course is not translatable' do
      let(:property_family_name) {'untranslatable_course'}

      it 'returns empty hash' do
        assert_equal({}, resources_i18n_data)
      end
    end

    context 'when the course i18n data does not exist' do
      let(:origin_course_i18n_file_data) do
        {}
      end

      it 'returns empty hash' do
        assert_equal({}, resources_i18n_data)
      end
    end

    context 'when the course i18n data is empty' do
      let(:origin_course_i18n_file_data) do
        {'resources' => []}
      end

      it 'returns empty hash' do
        assert_equal({}, resources_i18n_data)
      end
    end
  end

  describe '#prepare' do
    let(:prepare_i18n_source_file) {described_instance.send(:prepare)}

    let(:i18n_data) do
      {'en' => {'data' => {}}}
    end
    let(:resources_i18n_data) do
      {'resource_key' => 'new_resource_i18n_data'}
    end

    before do
      FileUtils.mkdir_p File.dirname(origin_i18n_file_path)
      File.write origin_i18n_file_path, YAML.dump(i18n_data)

      described_instance.stubs(:resources_i18n_data).returns(resources_i18n_data)
    end

    it 'prepares the i18n source file' do
      expected_i18n_source_file_content = <<~YAML
        ---
        en:
          data:
            resources:
              resource_key: new_resource_i18n_data
      YAML

      prepare_i18n_source_file

      assert File.exist?(i18n_source_file_path)
      assert_equal expected_i18n_source_file_content, File.read(i18n_source_file_path)
    end

    context 'when the source i18 data already contains resources i18n data' do
      let(:i18n_data) do
        {
          'en' => {
            'data' => {
              'resources' => {
                'resource_key' => 'old_resource_i18n_data',
                'resource_2_key' => 'old_resource_2_i18n_data'
              }
            }
          }
        }
      end

      it 'prepares the i18n source file with combined i18n resources data' do
        expected_i18n_source_file_content = <<~YAML
          ---
          en:
            data:
              resources:
                resource_key: new_resource_i18n_data
                resource_2_key: old_resource_2_i18n_data
        YAML

        prepare_i18n_source_file

        assert File.exist?(i18n_source_file_path)
        assert_equal expected_i18n_source_file_content, File.read(i18n_source_file_path)
      end
    end
  end

  describe '#redact' do
    let(:redact_i18n_source_content) {described_instance.send(:redact)}

    let(:origin_markdown_i18n_data) do
      {
        'description'         => 'origin_description',
        'student_description' => 'origin_student_description',
        'description_student' => 'origin_description_student',
        'description_teacher' => 'origin_description_teacher',
      }
    end
    let(:redacted_markdown_i18n_data) do
      {
        'description'         => 'redacted_description',
        'student_description' => 'redacted_student_description',
        'description_student' => 'redacted_description_student',
        'description_teacher' => 'redacted_description_teacher',
      }
    end
    let(:i18n_source_file_data) do
      {
        'en' => {
          'data' => {
            'course' => {
              'name' => {
                'course_name' => {
                  'unredactable' => 'unredactable_data',
                  **origin_markdown_i18n_data
                }
              }
            }
          }
        }
      }
    end

    before do
      RedactRestoreUtils.
        expects(:redact_data).
        with(origin_markdown_i18n_data, %w[resourceLink vocabularyDefinition], 'md').
        once.
        returns(redacted_markdown_i18n_data)

      FileUtils.mkdir_p File.dirname(i18n_source_file_path)
      File.write i18n_source_file_path, YAML.dump(i18n_source_file_data)
    end

    it 'backups the i18n source file' do
      redact_i18n_source_content

      assert File.exist?(i18n_backup_file_path)
      assert_equal i18n_source_file_data, YAML.load_file(i18n_backup_file_path)
    end

    it 'redacts the i18n source data' do
      expected_i18n_source_file_content = <<~YAML
        ---
        en:
          data:
            course:
              name:
                course_name:
                  unredactable: unredactable_data
                  description: redacted_description
                  student_description: redacted_student_description
                  description_student: redacted_description_student
                  description_teacher: redacted_description_teacher
      YAML

      redact_i18n_source_content

      assert File.exist?(i18n_source_file_path)
      assert_equal expected_i18n_source_file_content, File.read(i18n_source_file_path)
    end
  end
end
