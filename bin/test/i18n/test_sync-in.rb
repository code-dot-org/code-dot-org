require_relative '../test_helper'
require_relative '../../i18n/sync-in'

class I18n::SyncInTest < Minitest::Test
  def test_correct_methods_execution
    exec_seq = sequence('execution')

    Services::I18n::CurriculumSyncUtils.expects(:sync_in).in_sequence(exec_seq)
    HocSyncUtils.expects(:sync_in).in_sequence(exec_seq)
    I18n::SyncIn.expects(:localize_level_and_project_content).in_sequence(exec_seq)
    I18n::SyncIn.expects(:localize_block_content).in_sequence(exec_seq)
    I18n::Resources::Apps::Animations.expects(:sync_in).in_sequence(exec_seq)
    I18n::Resources::Dashboard::SharedFunctions.expects(:sync_in).in_sequence(exec_seq)
    I18n::Resources::Dashboard::CourseOfferings.expects(:sync_in).in_sequence(exec_seq)
    I18n::Resources::Dashboard::Standards.expects(:sync_in).in_sequence(exec_seq)
    I18n::Resources::Dashboard::Docs.expects(:sync_in).in_sequence(exec_seq)
    I18nScriptUtils.expects(:run_bash_script).with('bin/i18n-codeorg/in.sh').in_sequence(exec_seq)
    I18n::SyncIn.expects(:localize_external_sources).in_sequence(exec_seq)
    I18n::SyncIn.expects(:localize_course_resources).in_sequence(exec_seq)
    I18n::SyncIn.expects(:redact_level_content).in_sequence(exec_seq)
    I18n::SyncIn.expects(:redact_block_content).in_sequence(exec_seq)
    I18n::SyncIn.expects(:redact_script_and_course_content).in_sequence(exec_seq)
    I18n::SyncIn.expects(:redact_labs_content).in_sequence(exec_seq)
    I18n::SyncIn.expects(:localize_markdown_content).in_sequence(exec_seq)

    I18n::SyncIn.perform
  end

  def test_exception_handling
    expected_error = 'test error'

    Services::I18n::CurriculumSyncUtils.stubs(:sync_in).raises(expected_error)

    assert_raises expected_error do
      I18n::SyncIn.perform
    end
  end
end
