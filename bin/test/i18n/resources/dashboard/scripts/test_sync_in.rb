require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/scripts/sync_in'

describe I18n::Resources::Dashboard::Scripts::SyncIn do
  let(:described_class) {I18n::Resources::Dashboard::Scripts::SyncIn}
  let(:described_instance) {described_class.new}

  let(:origin_i18n_file_path) {CDO.dir('dashboard/config/locales/scripts.en.yml')}
  let(:i18n_backup_file_path) {CDO.dir('i18n/locales/original/dashboard/scripts.yml')}
  let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/dashboard/scripts.yml')}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    assert_equal I18n::Utils::SyncInBase, described_class.superclass
  end

  describe '#process' do
    let(:run_process) {described_instance.process}

    let(:redactable_i18n_data) do
      {
        'description' => 'redactable_script_desc',
        'student_description' => 'redactable_script_student_desc',
        'description_student' => 'redactable_script_desc_student',
        'description_teacher' => 'redactable_script_desc_teacher',
      }
    end
    let(:redacted_i18n_data) do
      {
        'description' => 'redacted_script_desc',
        'student_description' => 'redacted_script_student_desc',
        'description_student' => 'redacted_script_desc_student',
        'description_teacher' => 'redacted_script_desc_teacher',
      }
    end

    let(:origin_i18n_file_data) do
      {
        'en' => {
          'data' => {
            'script' => {
              'name' => {
                'script_name' => {
                  'underactable' => 'underactable_i18n_data',
                  **redactable_i18n_data,
                }
              }
            }
          }
        }
      }
    end

    before do
      FileUtils.mkdir_p File.dirname(origin_i18n_file_path)
      File.write origin_i18n_file_path, YAML.dump(origin_i18n_file_data)

      RedactRestoreUtils.
        stubs(:redact_data).
        with(redactable_i18n_data,  %w[resourceLink vocabularyDefinition], 'md').
        returns(redacted_i18n_data)
    end

    it 'backups the origin i18n file' do
      run_process

      assert File.exist?(i18n_backup_file_path)
      assert_equal origin_i18n_file_data, YAML.load_file(i18n_backup_file_path)
    end

    it 'prepares the i18n source file with redacted data' do
      expected_i18n_source_file_data = {
        'en' => {
          'data' => {
            'script' => {
              'name' => {
                'script_name' => {
                  'underactable' => 'underactable_i18n_data',
                  **redacted_i18n_data,
                }
              }
            }
          }
        }
      }

      run_process

      assert File.exist?(i18n_source_file_path)
      assert_equal expected_i18n_source_file_data, YAML.load_file(i18n_source_file_path)
    end
  end
end
