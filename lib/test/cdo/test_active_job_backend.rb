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
    CDO.stubs(:active_job_queues).returns(
      {
        default: :default,
        mailers: :mailers,
        mailjet: :mailjet,
        low_priority: :low_priority,
      }
    )
    CDO.stubs(:active_job_backend_worker_pool_percentages).returns(
      {
        low_priority: 10,
      }
    )

    Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_5_fresh_workers)
  end

  after do
    FileUtils.remove_entry(@pid_dir)
  end

  it 'restart_workers(): exception if stale workers at exit' do
    Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_5_stale_workers)

    Cdo::ActiveJobBackend.stubs(:stop_workers)
    Cdo::ActiveJobBackend.stubs(:start_n_workers).returns(5)

    error = assert_raises(RuntimeError) do
      Cdo::ActiveJobBackend.restart_workers_internal(5, n_batches: 1)
    end

    assert_match(/delayed_job: ERROR, old workers appear to still be running/, error.message)
  end

  describe 'restart_workers()' do
    before do
      Cdo::ActiveJobBackend.expects(:verify_no_workers_older_than!)
      @worker_queues = {0 => %w[default mailers mailjet]}
      Cdo::ActiveJobBackend.stubs(:worker_queues).returns(@worker_queues)
    end

    it 'can start 5 workers in 1 batch' do
      sequence = Mocha::Sequence.new('stop then start')
      Cdo::ActiveJobBackend.expects(:stop_workers).in_sequence(sequence).
        with {|pids, *| pids == [89890, 89892, 89894, 89936, 89938]}
      Cdo::ActiveJobBackend.expects(:start_n_workers).returns(5).in_sequence(sequence)

      n_workers_running = Cdo::ActiveJobBackend.restart_workers_internal(5, n_batches: 1)
      assert_equal 5, n_workers_running
    end

    it 'can start 5 workers in 2 batches' do
      sequence = Mocha::Sequence.new('stop then start')
      Cdo::ActiveJobBackend.expects(:stop_workers).with {|pids, *| pids == [89890, 89892, 89894]}.in_sequence(sequence)
      Cdo::ActiveJobBackend.expects(:start_n_workers).with(3, initial_worker_index: 0, worker_queues: @worker_queues).returns(3).in_sequence(sequence)
      Cdo::ActiveJobBackend.expects(:stop_workers).with {|pids, *| pids == [89936, 89938]}.in_sequence(sequence)
      Cdo::ActiveJobBackend.expects(:start_n_workers).with(2, initial_worker_index: 3, worker_queues: @worker_queues).returns(2).in_sequence(sequence)

      n_workers_running = Cdo::ActiveJobBackend.restart_workers_internal(5, n_batches: 2)
      assert_equal 5, n_workers_running
    end

    it 'can start 5 workers when only 4 are running' do
      Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_4_stale_workers)

      sequence = Mocha::Sequence.new('stop then start')
      Cdo::ActiveJobBackend.expects(:stop_workers).with {|pids, *| pids == [89890, 89892,]}.in_sequence(sequence)
      Cdo::ActiveJobBackend.expects(:start_n_workers).with(2, initial_worker_index: 0, worker_queues: @worker_queues).returns(2).in_sequence(sequence)
      Cdo::ActiveJobBackend.expects(:stop_workers).with {|pids, *| pids == [89894, 89936]}.in_sequence(sequence)
      Cdo::ActiveJobBackend.expects(:start_n_workers).with(2, initial_worker_index: 2, worker_queues: @worker_queues).returns(2).in_sequence(sequence)
      Cdo::ActiveJobBackend.expects(:start_n_workers).with(1, initial_worker_index: 4, worker_queues: @worker_queues).returns(1).in_sequence(sequence)
      Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_5_fresh_workers).in_sequence(sequence)

      n_workers_running = Cdo::ActiveJobBackend.restart_workers_internal(5, n_batches: 2)
      assert_equal 5, n_workers_running
    end

    it 'can start 4 workers when 5 are running' do
      Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_5_stale_workers)

      sequence = Mocha::Sequence.new('stop then start')
      Cdo::ActiveJobBackend.expects(:stop_workers).with {|pids, *| pids == [89890, 89892, 89894]}.in_sequence(sequence)
      Cdo::ActiveJobBackend.expects(:start_n_workers).with(3, initial_worker_index: 0, worker_queues: @worker_queues).returns(3).in_sequence(sequence)
      Cdo::ActiveJobBackend.expects(:stop_workers).with {|pids, *| pids == [89936, 89938]}.in_sequence(sequence)
      Cdo::ActiveJobBackend.expects(:start_n_workers).with(1, initial_worker_index: 3, worker_queues: @worker_queues).returns(2).in_sequence(sequence)
      Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_4_fresh_workers).in_sequence(sequence)

      n_workers_running = Cdo::ActiveJobBackend.restart_workers_internal(4, n_batches: 2)
      assert_equal 4, n_workers_running
    end

    it 'exception at exit if too few workers are running' do
      Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_4_fresh_workers)

      Cdo::ActiveJobBackend.stubs(:stop_workers)
      Cdo::ActiveJobBackend.stubs(:start_n_workers).returns(5)

      error = assert_raises(RuntimeError) do
        Cdo::ActiveJobBackend.restart_workers_internal(5, n_batches: 1)
      end

      assert_match(/delayed_job: ERROR/, error.message)
    end
  end

  describe 'worker_queues' do
    let(:n_workers) {0}
    let(:worker_queues) {Cdo::ActiveJobBackend.worker_queues(n_workers)}
    let(:_worker_queues) {_(worker_queues)}

    it 'returns no queues when starting no workers' do
      _worker_queues.must_equal({})
    end

    context 'with one worker' do
      let(:n_workers) {1}

      it 'runs all queues in one pool' do
        _worker_queues.must_equal(
          0 => %w[default mailers mailjet low_priority],
        )
      end
    end

    context 'with two workers' do
      let(:n_workers) {2}

      it 'splits workers one to one' do
        _worker_queues.must_equal(
          0 => %w[default mailers mailjet],
          1 => %w[low_priority],
        )
      end

      it 'runs all queues in the main pool when no dedicated pool is configured' do
        CDO.stubs(:active_job_backend_worker_pool_percentages).returns({})

        _worker_queues.must_equal(
          0 => %w[default mailers mailjet low_priority],
          1 => %w[default mailers mailjet low_priority],
        )
      end

      it 'keeps a configured queue in the main pool when it cannot receive a dedicated worker' do
        CDO.stubs(:active_job_backend_worker_pool_percentages).returns(
          {
            mailjet: 10,
            low_priority: 10,
          }
        )

        _worker_queues.must_equal(
          0 => %w[default mailers low_priority],
          1 => %w[mailjet],
        )
      end

      it 'keeps every queue served when dedicated pools outnumber workers' do
        CDO.stubs(:active_job_backend_worker_pool_percentages).returns(
          {
            default: 25,
            mailers: 25,
            mailjet: 25,
            low_priority: 25,
          }
        )

        _worker_queues.must_equal(
          0 => %w[mailers mailjet low_priority],
          1 => %w[default],
        )
      end
    end

    context 'with 140 workers' do
      let(:n_workers) {140}

      it 'allocates ten percent to low priority' do
        _(worker_queues.count {|_, queues| queues == %w[default mailers mailjet]}).must_equal 126
        _(worker_queues.count {|_, queues| queues == %w[low_priority]}).must_equal 14
      end

      it 'creates configured queue pools and puts unconfigured queues in the main pool' do
        CDO.stubs(:active_job_backend_worker_pool_percentages).returns(
          {
            mailjet: 10,
            low_priority: 10,
          }
        )

        _(worker_queues.count {|_, queues| queues == %w[default mailers]}).must_equal 112
        _(worker_queues.count {|_, queues| queues == %w[mailjet]}).must_equal 14
        _(worker_queues.count {|_, queues| queues == %w[low_priority]}).must_equal 14
      end
    end

    context 'with four workers' do
      let(:n_workers) {4}

      it 'does not reserve a main worker when every queue has a dedicated pool' do
        CDO.stubs(:active_job_backend_worker_pool_percentages).returns(
          {
            default: 25,
            mailers: 25,
            mailjet: 25,
            low_priority: 25,
          }
        )

        _worker_queues.must_equal(
          0 => %w[default],
          1 => %w[mailers],
          2 => %w[mailjet],
          3 => %w[low_priority],
        )
      end

      it 'keeps at least one low priority worker' do
        _worker_queues.must_equal(
          0 => %w[default mailers mailjet],
          1 => %w[default mailers mailjet],
          2 => %w[default mailers mailjet],
          3 => %w[low_priority],
        )
      end
    end
  end

  describe 'start_n_workers()' do
    it 'invokes run_process with correct process names and queues' do
      Cdo::ActiveJobBackend::Command.any_instance.expects(:run_process).with do |process_name, options|
        process_name == 'delayed_job.3' && options[:queues] == %w[default mailers mailjet]
      end.once
      Cdo::ActiveJobBackend::Command.any_instance.expects(:run_process).with do |process_name, options|
        process_name == 'delayed_job.4' && options[:queues] == %w[low_priority]
      end.once
      Cdo::ActiveJobBackend.start_n_workers(
        2,
        initial_worker_index: 3,
        worker_queues: {
          3 => %w[default mailers mailjet],
          4 => %w[low_priority],
        }
      )
    end

    it 'does not apply queue options without worker queue assignments' do
      Cdo::ActiveJobBackend::Command.any_instance.expects(:run_process).with do |process_name, options|
        process_name == 'delayed_job.3' && !options.key?(:queues)
      end.once
      Cdo::ActiveJobBackend::Command.any_instance.expects(:run_process).with do |process_name, options|
        process_name == 'delayed_job.4' && !options.key?(:queues)
      end.once
      Cdo::ActiveJobBackend.start_n_workers(2, initial_worker_index: 3)
    end

    it 'uses the assignment hash default if a worker index is omitted' do
      Cdo::ActiveJobBackend::Command.any_instance.expects(:run_process).with do |process_name, options|
        process_name == 'delayed_job.1' && options[:queues] == %w[default mailers mailjet]
      end.once

      worker_queues = Hash.new(%w[default mailers mailjet])
      Cdo::ActiveJobBackend.start_n_workers(1, initial_worker_index: 1, worker_queues:)
    end
  end

  describe 'Command' do
    it 'invokes valid methods of superclass Delayed::Command' do
      assert Delayed::Command.method_defined?(:run_process)
    end
  end

  describe 'stop_workers()' do
    before do
      Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_4_stale_workers)
      @stale_worker_pids = [89890, 89892, 89894, 89936]
    end

    it 'SIGTERMs workers first' do
      sequence = Mocha::Sequence.new('stop_workers')
      Cdo::ActiveJobBackend.expects(:kill).times(4).with('TERM', anything).in_sequence(sequence)
      Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_no_workers).in_sequence(sequence)

      Cdo::ActiveJobBackend.stop_workers(@stale_worker_pids, {})
    end

    it "SIGKILLs workers if they don't exit after SIGTERM" do
      sequence = Mocha::Sequence.new('stop_workers')
      Cdo::ActiveJobBackend.expects(:kill).times(4).with('TERM', anything).in_sequence(sequence)
      Cdo::ActiveJobBackend.expects(:kill).times(4).with('KILL', anything).in_sequence(sequence)
      Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_no_workers).in_sequence(sequence)

      Cdo::ActiveJobBackend.stop_workers(@stale_worker_pids, {}, timeout_s: 1)
    end

    it "raises exception if workers don't exit after SIGKILL" do
      sequence = Mocha::Sequence.new('stop_workers')
      Cdo::ActiveJobBackend.expects(:kill).times(4).with('TERM', anything).in_sequence(sequence)
      Cdo::ActiveJobBackend.expects(:kill).times(4).with('KILL', anything).in_sequence(sequence)

      error = assert_raises(Timeout::Error) do
        Cdo::ActiveJobBackend.stop_workers(@stale_worker_pids, {}, timeout_s: 1)
      end

      assert_match(/delayed_job: ERROR, not all delayed_job worker processes terminated/, error.message)
    end

    it 'cleans up pid files' do
      Cdo::ActiveJobBackend.stubs(:kill)
      Cdo::ActiveJobBackend.stubs(:wait_for_workers_to_exit)

      pid_file = File.join(@pid_dir, 'delayed_job.1.pid')
      File.write(pid_file, '1001')

      Cdo::ActiveJobBackend.stop_workers([1001], {1001 => pid_file})
      refute File.exist?(pid_file)
    end
  end

  describe 'verify_num_workers_running!()' do
    it 'succeeds when n_workers_to_start matches ps' do
      assert_equal 5, Cdo::ActiveJobBackend.verify_num_workers_running!(5)
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
      Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_for_4_stale_workers)

      # Expect an exception due to stale workers
      error = assert_raises(RuntimeError) do
        Cdo::ActiveJobBackend.verify_no_workers_older_than!(Time.now - 60.seconds)
      end

      assert_match (/delayed_job: ERROR, old workers appear to still be running/), error.message
    end

    it 'works even if linux etime rounds up' do
      # Linux `ps -o etime` appears to round up to the nearest second, so
      # delayed_job.0 here might have actually been running for only 0.5s:
      ps_with_worker_runtime_only_1s = <<~HEREDOC
          PID     ELAPSED COMMAND
        89890       00:01 delayed_job.0
      HEREDOC
      Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(ps_with_worker_runtime_only_1s)

      assert_silent do
        Cdo::ActiveJobBackend.verify_no_workers_older_than!(Time.now)
      end
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

    it 'correctly parses complex ps output' do
      Cdo::ActiveJobBackend::ExistingWorkers.stubs(:ps).returns(complex_ps_output)

      assert_equal [
        # job_id, pid, runtime_seconds
        [0, 89890, 583],   # delayed_job.0
        [1, 89892, 583],   # delayed_job.1
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

  private def ps_for_5_fresh_workers
    <<~HEREDOC
        PID     ELAPSED COMMAND
      89890       00:23 delayed_job.0
      89892       00:23 delayed_job.1
      89894       00:24 delayed_job.2
      89936       00:06 delayed_job.3
      89938       00:06 delayed_job.4
    HEREDOC
  end

  private def ps_for_5_stale_workers
    <<~HEREDOC
        PID     ELAPSED COMMAND
      89890 01-06:44:22 delayed_job.0
      89892 01-06:44:22 delayed_job.1
      89894 01-06:44:22 delayed_job.2
      89936 01-06:44:22 delayed_job.3
      89938 01-06:44:22 delayed_job.4
    HEREDOC
  end

  private def ps_for_4_fresh_workers
    <<~HEREDOC
        PID     ELAPSED COMMAND
      89890       00:23 delayed_job.0
      89892       00:23 delayed_job.1
      89894       00:24 delayed_job.2
      89936       00:06 delayed_job.3
    HEREDOC
  end

  private def ps_for_4_stale_workers
    <<~HEREDOC
        PID     ELAPSED COMMAND
      89890 01-06:44:22 delayed_job.0
      89892 01-06:44:22 delayed_job.1
      89894 01-06:44:22 delayed_job.2
      89936 01-06:44:22 delayed_job.3
    HEREDOC
  end

  private def ps_for_no_workers
    <<~HEREDOC
      PID     ELAPSED COMMAND
        1 01-12:45:40 /sbin/launchd
    HEREDOC
  end

  private def complex_ps_output
    <<~HEREDOC
        PID     ELAPSED COMMAND
          1 01-12:45:40 /sbin/launchd
        512 01-12:44:22 /usr/libexec/logd
        513 01-12:44:22 /usr/libexec/smd
        514 01-12:44:22 /usr/libexec/UserEventAgent (System)
      89890       09:43 delayed_job.0
      89892       09:43 delayed_job.1
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
