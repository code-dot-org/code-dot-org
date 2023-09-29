require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/scripts'

class I18n::Resources::Dashboard::ScriptsTest < Minitest::Test
  def test_sync_in
    exec_seq = sequence('execution')

    expected_i18n_source_file_path = CDO.dir('i18n/locales/source/dashboard/scripts.yml')
    expected_i18n_source_file_data = {
      'en' => {
        'data' => {
          'script' => {
            'name' => {
              'csd' => {
                'assignment_family_title' => 'csd -> assignment_family_title',
                'title'                   => 'csd -> title',
                'version_title'           => 'csd -> version_title',
                'description'             => 'csd -> description',
                'student_description'     => 'csd -> student_description',
                'description_student'     => 'csd -> description_student',
                'description_teacher'     => 'csd -> description_teacher',
                'description_short'       => 'csd -> description_short'
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
      'description'         => 'csd -> description',
      'student_description' => 'csd -> student_description',
      'description_student' => 'csd -> description_student',
      'description_teacher' => 'csd -> description_teacher',
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
          'script' => {
            'name' => {
              'csd' => {
                'assignment_family_title' => 'csd -> assignment_family_title',
                'title'                   => 'csd -> title',
                'version_title'           => 'csd -> version_title',
                'description_short'       => 'csd -> description_short',
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

    # Preparation of the i18n source file
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/dashboard')).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(CDO.dir('dashboard/config/locales/scripts.en.yml'), expected_i18n_source_file_path).in_sequence(exec_seq)

    # Redaction of the i18n source file
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/original/dashboard')).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(expected_i18n_source_file_path, CDO.dir('i18n/locales/original/dashboard/scripts.yml')).in_sequence(exec_seq)
    YAML.expects(:load_file).with(expected_i18n_source_file_path).returns(expected_i18n_source_file_data).in_sequence(exec_seq)
    RedactRestoreUtils.expects(:redact_data).with(expected_redaction_data, %w[resourceLink vocabularyDefinition], 'md').returns(expected_redacted_data).in_sequence(exec_seq)
    I18nScriptUtils.expects(:to_crowdin_yaml).with(expected_redacted_i18n_source_data).returns('expected_redacted_i18n_source_yaml_data').in_sequence(exec_seq)
    File.expects(:write).with(expected_i18n_source_file_path, 'expected_redacted_i18n_source_yaml_data').in_sequence(exec_seq)

    I18n::Resources::Dashboard::Scripts.sync_in
  end
end
