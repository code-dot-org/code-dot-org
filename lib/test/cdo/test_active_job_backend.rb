require_relative '../test_helper'
require 'cdo/active_job_backend'
require 'tmpdir'

describe 'Cdo::ActiveJobBackend' do
  before do
    Cdo::ActiveJobBackend.stubs(:chat_client_log)
  end

  describe 'verify_no_workers_older_than!' do
    it 'succeeds if all workers are fresh' do
      Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_fresh_workers)

      assert_silent do
        Cdo::ActiveJobBackend.verify_no_workers_older_than!(Time.now - 60.seconds)
      end
    end

    it 'raises an error if old workers are still running' do
      Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_stale_workers)

      # Expect an exception due to stale workers
      error = assert_raises(RuntimeError) do
        Cdo::ActiveJobBackend.verify_no_workers_older_than!(Time.now - 60.seconds)
      end

      assert_match (/delayed_job: ERROR, old workers appear to still be running/), error.message
    end
  end

  describe 'ExistingWorkers' do
    describe 'pids()' do
      it 'returns pids from both ps output and pid files' do
        Dir.mktmpdir do |temp_dir|
          Cdo::ActiveJobBackend.stubs(:pid_dir).returns(temp_dir)
          Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_fresh_workers)

          # 1000 should not show up in return values because ps wins on pid if it disagrees with pid_file
          # however, the pidfile should show up for process 89892 from ps so it is deleted:
          File.write(File.join(temp_dir, 'delayed_job.1.pid'), '1000')
          File.write(File.join(temp_dir, 'delayed_job.11.pid'), '1001')

          pids, pid_files = Cdo::ActiveJobBackend::ExistingWorkers.pids

          assert_equal [89890, 89892, 89894, 89936, 89938, 1001].sort, pids.sort
          expected_pid_files = {
            89892 => "#{temp_dir}/delayed_job.1.pid",
            1001 => "#{temp_dir}/delayed_job.11.pid",
            89890 => nil,
            89894 => nil,
            89936 => nil,
            89938 => nil
          }
          assert_equal expected_pid_files, pid_files
        end
      end
    end

    it 'correctly parses ps output' do
      Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_stale_workers)

      assert_equal [
        # job_id, pid, runtime_seconds
        [0, 89890, 583],   # delayed_job.0
        [1, 89892, 583],   # delayed_job.1
        [2, 89894, 583],   # delayed_job.2
        [3, 89936, 577],   # delayed_job.3
        [4, 89938, 110662] # delayed_job.4
      ], Cdo::ActiveJobBackend::ExistingWorkers.get_workers_from_ps
    end

    it 'retrieves workers from pid files' do
      Dir.mktmpdir do |temp_dir|
        Cdo::ActiveJobBackend.stubs(:pid_dir).returns(temp_dir)

        File.write(File.join(temp_dir, 'delayed_job.1.pid'), '1000')
        File.write(File.join(temp_dir, 'delayed_job.11.pid'), '1001')

        workers = Cdo::ActiveJobBackend::ExistingWorkers.get_workers_from_pid_files
        assert_equal [
          [1, 1000, "#{temp_dir}/delayed_job.1.pid"],
          [11, 1001, "#{temp_dir}/delayed_job.11.pid"]
        ], workers
      end
    end
  end

  private def ps_for_fresh_workers
    <<~HEREDOC
        PID     ELAPSED COMMAND
      89890       00:23 delayed_job.0
      89892       00:23 delayed_job.1
      89894       00:24 delayed_job.2
      89936       00:06 delayed_job.3
      89938       00:06 delayed_job.4
    HEREDOC
  end

  private def ps_for_stale_workers
    <<~HEREDOC
        PID     ELAPSED COMMAND
          1 01-12:45:40 /sbin/launchd
        512 01-12:44:22 /usr/libexec/logd
        513 01-12:44:22 /usr/libexec/smd
        514 01-12:44:22 /usr/libexec/UserEventAgent (System)
      89890       09:43 delayed_job.0
      89892       09:43 delayed_job.1
      89894       09:43 delayed_job.2
      39574    03:02:20 /bin/zsh -il
      89936       09:37 delayed_job.3
      89938 01-06:44:22 delayed_job.4
        555 01-12:45:40 /usr/sbin/securityd -i
        558 01-12:45:40 /usr/libexec/nesessionmanager
        560 01-12:45:40 autofsd
        561 01-12:45:40 /usr/libexec/dasd
        563 01-12:45:40 /usr/sbin/distnoted daemon
    HEREDOC
  end
end
