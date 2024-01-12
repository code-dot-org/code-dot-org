require_relative '../../shared/test/test_helper'
require_relative '../ci_builder'
require 'cdo/rake_utils'

class TestCiBuilder < Minitest::Test
  def test_update_repository_with_updates
    RakeUtils.stubs(:git_fetch)
    RakeUtils.stubs(:git_update_count).returns(5)
    RakeUtils.expects(:git_pull).once
    assert_equal 5, CiBuilder.send(:update_repository)
  end

  def test_update_repository_without_updates
    RakeUtils.stubs(:git_fetch)
    RakeUtils.stubs(:git_update_count).returns(0)
    RakeUtils.expects(:git_pull).never
    assert_equal 1, CiBuilder.send(:update_repository)
  end

  def test_log_build_history
    git_expected_log_output = "abc123 Fix bug (Alice)\ndef456 Add feature (Bob)"
    RakeUtils.stubs(:git_update_count).returns(2)
    CiBuilder.stubs(:`).with("git log --pretty=format:\"%h %s (%an)\" -n 2").returns(git_expected_log_output)
    expected_file_path = "#{CiBuilder.send(:deploy_dir)}/rebuild"
    File.expects(:write).with(expected_file_path, git_expected_log_output).once
    CiBuilder.send(:log_build_history, 2)
  end

  def test_execute_ci_task_success
    RakeUtils.stubs(:rake_stream_output).with('ci').returns(0)
    CiBuilder.stubs(:validate_git_revision)
    FileUtils.stubs(:rm).with(CiBuilder::BUILD_STARTED)
    result = CiBuilder.send(:execute_ci_task)
    assert_equal 0, result
  end

  def test_execute_ci_task_failure
    RakeUtils.stubs(:rake_stream_output).with('ci').raises(RuntimeError.new('Error'))
    CDO.expects(:backtrace).with(instance_of(RuntimeError)).once
    CiBuilder.send(:execute_ci_task)
  end

  def test_notify_honeybadger_about_release
    RakeUtils.stubs(:git_revision).returns("abcd1234")
    Honeybadger.expects(:notify_new_release).with(anything, "abcd1234").once
    CiBuilder.send(:notify_honeybadger)
  end
end
