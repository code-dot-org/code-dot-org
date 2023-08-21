require_relative '../test_helper'
require_relative '../../i18n/sync-out'

class I18n::SyncOutTest < Minitest::Test
  def test_performing
    exec_seq = sequence('execution')

    I18n::Resources::Apps.expects(:sync_out).in_sequence(exec_seq)
    I18n::SyncOut.expects(:rename_from_crowdin_name_to_locale).in_sequence(exec_seq)
    I18n::SyncOut.expects(:restore_redacted_files).in_sequence(exec_seq)
    I18n::SyncOut.expects(:distribute_translations).in_sequence(exec_seq)
    I18n::SyncOut.expects(:copy_untranslated_apps).in_sequence(exec_seq)
    I18n::SyncOut.expects(:rebuild_blockly_js_files).in_sequence(exec_seq)
    I18n::SyncOut.expects(:restore_markdown_headers).in_sequence(exec_seq)
    Services::I18n::CurriculumSyncUtils.expects(:sync_out).in_sequence(exec_seq)
    HocSyncUtils.expects(:sync_out).in_sequence(exec_seq)
    I18nScriptUtils.expects(:run_standalone_script).with('dashboard/scripts/update_tts_i18n.rb').in_sequence(exec_seq)
    I18nScriptUtils.expects(:run_standalone_script).with('dashboard/scripts/update_tts_i18n_static_messages.rb').in_sequence(exec_seq)
    I18n::SyncOut.expects(:clean_up_sync_out).with('expected_CROWDIN_PROJECTS').in_sequence(exec_seq)

    I18n::SyncOut.stub_const(:CROWDIN_PROJECTS, 'expected_CROWDIN_PROJECTS') do
      I18n::SyncOut.perform
    end
  end

  def test_exception_handling
    expected_error = 'expected_error'

    I18n::Resources::Apps.stubs(:sync_out).raises(expected_error)
    I18n::SyncOut.stubs(:rename_from_crowdin_name_to_locale).raises(expected_error)
    I18n::SyncOut.stubs(:rename_from_crowdin_name_to_locale).raises(expected_error)
    I18n::SyncOut.stubs(:restore_redacted_files).raises(expected_error)
    I18n::SyncOut.stubs(:distribute_translations).raises(expected_error)
    I18n::SyncOut.stubs(:copy_untranslated_apps).raises(expected_error)
    I18n::SyncOut.stubs(:rebuild_blockly_js_files).raises(expected_error)
    I18n::SyncOut.stubs(:restore_markdown_headers).raises(expected_error)
    Services::I18n::CurriculumSyncUtils.stubs(:sync_out).raises(expected_error)
    HocSyncUtils.stubs(:sync_out).raises(expected_error)
    I18nScriptUtils.stubs(:run_standalone_script).raises(expected_error)
    I18nScriptUtils.stubs(:run_standalone_script).raises(expected_error)
    I18n::SyncOut.stubs(:clean_up_sync_out).raises(expected_error)

    assert_raises(expected_error) {I18n::SyncOut.perform}
  end
end
