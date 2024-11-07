require_relative '../test_helper'
require 'cdo/active_job_backend'
require 'tmpdir'

describe 'Cdo::ActiveJobBackend' do
  before do
    Cdo::ActiveJobBackend.stubs(:chat_client_log)
    Cdo::ActiveJobBackend.stubs(:log)
    Cdo::ActiveJobBackend.stubs(:before_worker_fork)

    @pid_dir = Dir.mktmpdir
    Cdo::ActiveJobBackend.stubs(:pid_dir).returns(@pid_dir)

    Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_fresh_workers)
  end

  after do
    FileUtils.remove_entry(@pid_dir)
  end

  describe 'restart_workers_internal()' do
    describe 'it stops and starts in batches' do
      before do
        Cdo::ActiveJobBackend.expects(:verify_no_workers_older_than!)
      end

      it 'can restart 5 workers in one batch' do
        sequence = Mocha::Sequence.new('stop then start')
        Cdo::ActiveJobBackend.expects(:stop_workers).in_sequence(sequence).
          with {|pids, *| pids == [89890, 89892, 89894, 89936, 89938]}
        Cdo::ActiveJobBackend.expects(:start_n_workers).returns(5).in_sequence(sequence)

        n_workers_running = Cdo::ActiveJobBackend.restart_workers_internal(5, n_batches: 1)
        assert_equal 5, n_workers_running
      end

      it 'can restart 5 workers in two batches' do
        sequence = Mocha::Sequence.new('stop then start')
        Cdo::ActiveJobBackend.expects(:stop_workers).with {|pids, *| pids == [89890, 89892, 89894]}.in_sequence(sequence)
        Cdo::ActiveJobBackend.expects(:start_n_workers).with(3, initial_worker_index: 0).returns(3).in_sequence(sequence)
        Cdo::ActiveJobBackend.expects(:stop_workers).with {|pids, *| pids == [89936, 89938]}.in_sequence(sequence)
        Cdo::ActiveJobBackend.expects(:start_n_workers).with(2, initial_worker_index: 3).returns(2).in_sequence(sequence)

        n_workers_running = Cdo::ActiveJobBackend.restart_workers_internal(5, n_batches: 2)
        assert_equal 5, n_workers_running
      end
    end
  end

  describe 'start_n_workers()' do
    it 'calls run_process with the right worker index in the name' do
      Cdo::ActiveJobBackend::Command.any_instance.expects(:run_process).with('delayed_job.3', anything).once
      Cdo::ActiveJobBackend::Command.any_instance.expects(:run_process).with('delayed_job.4', anything).once
      Cdo::ActiveJobBackend.start_n_workers(2, initial_worker_index: 3)
    end
  end

  describe 'verify_num_workers_running!()' do
    it 'succeeds when n_workers_to_start matches ps' do
      assert_equal 5, Cdo::ActiveJobBackend.verify_num_workers_running!(4)
    end

    it 'exception when n_workers_to_start does not match ps' do
      error = assert_raises(RuntimeError) do
        Cdo::ActiveJobBackend.verify_num_workers_running!(10)
      end

      assert_match(/delayed_job: ERROR, intended to start 10 workers, but only 5 workers are running/, error.message)
    end
  end

  describe 'verify_no_workers_older_than!()' do
    it 'succeeds if all workers are fresh' do
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
        pid_file_1 = File.join(@pid_dir, 'delayed_job.1.pid')
        pid_file_11 = File.join(@pid_dir, 'delayed_job.11.pid')

        # 1000 should not show up in return values because ps wins on pid if it disagrees with pid_file
        # however, the pidfile should show up for process 89892 from ps so it is deleted:
        File.write(pid_file_1, '1000')
        File.write(pid_file_11, '1001')

        pids, pid_files = Cdo::ActiveJobBackend::ExistingWorkers.pids

        assert_equal [89890, 89892, 89894, 89936, 89938, 1001].sort, pids.sort
        expected_pid_files = {
          89892 => pid_file_1,
          1001 => pid_file_11,
          89890 => nil,
          89894 => nil,
          89936 => nil,
          89938 => nil
        }
        assert_equal expected_pid_files, pid_files
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

  private def ps_for_fresh_workers_partially_started
    <<~HEREDOC
        PID     ELAPSED COMMAND
      89890       00:23 delayed_job.0
      89892       00:23 delayed_job.1
      89894       00:24 delayed_job.2
      89936       00:06 delayed_job.3
    HEREDOC
  end
end
