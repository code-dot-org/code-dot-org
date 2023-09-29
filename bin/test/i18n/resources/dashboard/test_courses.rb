require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/courses'

class I18n::Resources::Dashboard::CoursesTest < Minitest::Test
  def test_sync_in
    exec_seq = sequence('execution')

    expected_i18n_source_file_path = CDO.dir('i18n/locales/source/dashboard/courses.yml')
    expected_i18n_source_file_data = {
      'en' => {
        'data' => {
          'course' => {
            'name' => {
              'valid_course_csd' => {
                'assignment_family_title' => 'valid_course_csd -> assignment_family_title',
                'title'                   => 'valid_course_csd -> title',
                'version_title'           => 'valid_course_csd -> version_title',
                'description'             => 'valid_course_csd -> description',
                'student_description'     => 'valid_course_csd -> student_description',
                'description_student'     => 'valid_course_csd -> description_student',
                'description_teacher'     => 'valid_course_csd -> description_teacher',
                'description_short'       => 'valid_course_csd -> description_short'
              }
            }
          },
          'resources' => {
            'resource_1_key/csd/1970' => {
              'name' => 'Resource 1',
              'url' => '/courses/course-1/resources'
            }
          }
        }
      }
    }

    expected_redaction_data = {
      'description'         => 'valid_course_csd -> description',
      'student_description' => 'valid_course_csd -> student_description',
      'description_student' => 'valid_course_csd -> description_student',
      'description_teacher' => 'valid_course_csd -> description_teacher',
    }
    expected_redacted_data = {
      'description'         => 'redacted -> description',
      'student_description' => 'redacted -> student_description',
      'description_student' => 'redacted -> description_student',
      'description_teacher' => 'redacted -> description_teacher',
    }
    expected_redacted_i18n_source_data = {
      'en' => {
        'data' => {
          'course' => {
            'name' => {
              'valid_course_csd' => {
                'assignment_family_title' => 'valid_course_csd -> assignment_family_title',
                'title'                   => 'valid_course_csd -> title',
                'version_title'           => 'valid_course_csd -> version_title',
                'description_short'       => 'valid_course_csd -> description_short',
                **expected_redacted_data
              }
            }
          },
          'resources' => {
            'resource_1_key/csd/1970' => {
              'name' => 'Resource 1',
              'url' => '/courses/course-1/resources'
            }
          }
        }
      }
    }

    Dir.stubs(:[]).with(CDO.dir('dashboard/config/courses/*.course')).returns(%w[invalid_course_csd_without_resources invalid_course_not_csd valid_course_csd])
    JSON.stubs(:load_file).with('invalid_course_csd_without_resources').returns(invalid_course_csd_without_resources_data)
    JSON.stubs(:load_file).with('invalid_course_not_csd').returns(invalid_course_not_csd_data)
    JSON.stubs(:load_file).with('valid_course_csd').returns(valid_course_csd_data)
    YAML.stubs(:load_file).with(expected_i18n_source_file_path).returns(i18n_source_data_without_resources, expected_i18n_source_file_data)

    # Preparation of the i18n source file
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/dashboard')).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(CDO.dir('dashboard/config/locales/courses.en.yml'), expected_i18n_source_file_path).in_sequence(exec_seq)
    I18nScriptUtils.expects(:to_crowdin_yaml).with(expected_i18n_source_file_data).returns('expected_i18n_source_file_data').in_sequence(exec_seq)
    File.expects(:write).with(expected_i18n_source_file_path, 'expected_i18n_source_file_data').in_sequence(exec_seq)

    # Redaction of the i18n source file
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/original/dashboard')).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(expected_i18n_source_file_path, CDO.dir('i18n/locales/original/dashboard/courses.yml')).in_sequence(exec_seq)
    RedactRestoreUtils.expects(:redact_data).with(expected_redaction_data, %w[resourceLink vocabularyDefinition], 'md').returns(expected_redacted_data).in_sequence(exec_seq)
    I18nScriptUtils.expects(:to_crowdin_yaml).with(expected_redacted_i18n_source_data).returns('expected_redacted_i18n_source_yaml_data').in_sequence(exec_seq)
    File.expects(:write).with(expected_i18n_source_file_path, 'expected_redacted_i18n_source_yaml_data').in_sequence(exec_seq)

    I18n::Resources::Dashboard::Courses.sync_in
  end

  private

  def invalid_course_csd_without_resources_data
    {
      'name' => 'invalid_course_csd_without_resources',
      'properties' => {
        'family_name' => 'csd'
      },
      'resources' => []
    }
  end

  def invalid_course_not_csd_data
    {
      'name' => 'invalid_course_not_csd',
      'properties' => {
        'family_name' => 'not_csd'
      },
      'resources' => [
        'name' => 'invalid_course_not_csd -> resources -> name'
      ]
    }
  end

  def valid_course_csd_data
    {
      'name' => 'valid_course_csd',
      'script_names' => %w[script_name_1 script_name_2],
      'published_state' => 'stable',
      'instruction_type' => 'teacher_led',
      'participant_audience' => 'student',
      'instructor_audience' => 'teacher',
      'properties' => {
        'family_name' => 'csd',
        'has_numbered_units' => true,
        'has_verified_resources' => true,
        'version_year' => '1970'
      },
      'resources' => [
        {
          'name' => 'Resource 1',
          'url' => '/courses/course-1/resources',
          'key' => 'resource_1_key',
          'properties' => {
            'is_rollup' => true
          },
          'seeding_key' => {
            'resource.key' => 'seeding_key_resource_key_1'
          }
        }
      ],
      'student_resources' => []
    }
  end

  def i18n_source_data_without_resources
    {
      'en' => {
        'data' => {
          'course' => {
            'name' => {
              'valid_course_csd' => {
                'assignment_family_title' => 'valid_course_csd -> assignment_family_title',
                'title'                   => 'valid_course_csd -> title',
                'version_title'           => 'valid_course_csd -> version_title',
                'description'             => 'valid_course_csd -> description',
                'student_description'     => 'valid_course_csd -> student_description',
                'description_student'     => 'valid_course_csd -> description_student',
                'description_teacher'     => 'valid_course_csd -> description_teacher',
                'description_short'       => 'valid_course_csd -> description_short'
              }
            }
          }
        }
      }
    }
  end
end
