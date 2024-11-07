require 'cdo/chat_client'
require 'delayed/command'

module Cdo
  module ActiveJobBackend
    # Restarts delayed_job workers in a rolling fashion, to prevent downtime.
    def self.restart_workers(n_workers_to_start:, rolling_restart_in_n_batches: 1)
      pid = fork do
        # pre-cache Rails environment so each `delayed_job` worker command invocation
        # doesn't take N minutes on production.
        before_worker_fork
        _rolling_restart(n_workers_to_start, n_batches: rolling_restart_in_n_batches)
      end
      Process.wait(pid)
    end

    def self._rolling_restart(n_workers_to_start, n_batches:)
      pids, pid_file_hash = ExistingWorkers.pids
      n_workers_to_restart_per_batch = (pids.size.to_f / n_batches).ceil
      n_workers_to_restart_per_batch = 1 if n_workers_to_restart_per_batch < 1

      ChatClient.log("delayed_job: rolling deploy of #{n_workers_to_start} workers, restarting in #{n_batches} batches of #{n_workers_to_restart_per_batch}, replacing #{pids.size} existing workers")

      # We delete ALL existing delayed_job pid_files in pid_dir (dashboard/tmp/pids)
      # before we even start in order to work around a horrible bug in delayed_job:
      #
      # If delayed_job.2.pid doesn't exist, but delayed_job.22.pid does exist,
      # delayed_job will think delayed_job.22.pid is delayed_job.2 and therefore
      # already running, so when you try to start delayed_job.2 it will refuse
      # to start and error out with:
      #     ERROR: there is already one or more instance(s) of the program running
      #
      # Deleting all the pid_files before killing the processes isn't as bad as it sounds, since:
      # 1. We already fetched pids, and we're gonna kill them all anyway
      # 2. Even if we crash, we actually consider the union of pid files and ps output
      #    so losing the pid files is completely recoverable, we'll still reap those processes
      #    next time.
      delete_pid_files(pids, pid_file_hash)

      # Stop and Start workers in equal-sized rolling batches to prevent downtime
      n_workers_started = 0
      pids.each_slice(n_workers_to_restart_per_batch) do |pids_in_batch|
        # Stop pre-existing delayed_job workers in this batch
        stop_workers(pids_in_batch, pid_file_hash)

        # Start (up to) an equal number of replacement workers
        n_workers = (n_workers_to_start - n_workers_started).clamp(0, pids_in_batch.size)
        n_workers_started += start_n_workers(n_workers, initial_worker_index: n_workers_started) if n_workers > 0
      end

      # Start any remaining workers (=we're starting more workers than previously existed)
      n_workers = n_workers_to_start - n_workers_started
      n_workers_started += start_n_workers(n_workers, initial_worker_index: n_workers_started) if n_workers > 0

      check_worker_status(n_workers_to_start)
    end

    def self.check_worker_status(n_workers_to_start)
      # We're done, now we're just printing informative messages:
      pids, _ = ExistingWorkers.pids
      n_workers_running = pids.size
      ChatClient.log("delayed_job: rolling deploy done, (re)started #{n_workers_running} workers")

      # Warn/Error if we didn't start the intended number of workers
      if n_workers_to_start != 0 && n_workers_running == 0
        msg = "delayed_job: ERROR no workers running after worker restart, expected #{n_workers_to_start} workers"
        ChatClient.log msg
        raise Exception.new(msg)
      elsif n_workers_to_start != n_workers_running
        ChatClient.log("delayed_job: WARNING, intended to start #{n_workers_to_start} workers, but #{n_workers_running} workers are running. If this is a significant difference, this production deploy may have issues!")
      end
      n_workers_running
    end

    # Load rails environment into memory before forking workers so
    # that they share all this memory and don't have to reload it.
    def self.before_worker_fork
      require dashboard_dir('config', 'environment')
      Delayed::Worker.before_fork
    end

    # run bin/delayed_job by forking our custom Cdo::DelayedJob::Command subclass
    def self.start_n_workers(n_workers, initial_worker_index:)
      ChatClient.log("delayed_job: starting #{n_workers} workers, initial_worker_index=#{initial_worker_index}")
      pid = fork do
        Cdo::ActiveJobBackend::Command.new.start_n_workers(n_workers, initial_worker_index: initial_worker_index)
      end
      Process.wait(pid) # wait for the workers to start
      return n_workers
    end

    # Subclass Delayed::Command from delayed_job/command and add a new method to it
    # that allow us to specify the initial worker index when spawning new
    # delayed_job.N workers. This allows us to start workers in multiple batches.
    #
    # By calling before_worker_fork before forking the command processes
    # our multiple batches even share memory, and don't have to wait to load
    # the Rails environment for each batch either.
    class Command < Delayed::Command
      def initialize
        @options = {
          :quiet => true,
          :pid_dir => Cdo::ActiveJobBackend.pid_dir,
          :log_dir => Cdo::ActiveJobBackend.log_dir,
        }
        @args = ["start"]
      end

      # New method that allows us to specify the initial worker index
      def start_n_workers(n_workers, initial_worker_index: 0)
        Cdo::ActiveJobBackend.before_worker_fork
        n_workers.times do |worker_index|
          process_name = "delayed_job.#{worker_index + initial_worker_index}"
          puts "\tstarting delayed_job worker: #{process_name}"
          run_process(process_name, @options)
        end
      end
    end

    # Gently stops a list of pids by sending TERM first, waiting
    # timeout_s for them to exit gracefully, and then sending KILL
    def self.stop_workers(pids, pid_file_hash, timeout_s: 30.seconds)
      ChatClient.log "delayed_job: stopping #{pids.size} workers"

      # Send a TERM to each pid, which tells them to finish the current job and exit
      pids.each {|pid| kill('TERM', pid)}

      # Wait timeout_s for the processes to exit gracefully
      wait_for_workers_to_exit(pids, timeout_s)
    rescue Timeout::Error
      puts "Timeout reached. Not all processes terminated within #{timeout_seconds} seconds."
      # Send a kill to any remaining processes, which stops them immediately
      pids_still_running = pids.reject {|pid| process_finished?(pid)}
      pids_still_running.each {|pid| kill('KILL', pid)}
      begin
        wait_for_workers_to_exit(pids_still_running, timeout_s)
      rescue Timeout::Error
        ChatClient.log "ERROR: not all delayed_job worker processes terminated within #{timeout_seconds} seconds despite sending SIGKILL, aborting deploy due to the debugging risk of workers running old code."
        raise
      end
    ensure
      # delete pid files for workers that have exited, if they exist
      delete_pid_files(pids, pid_file_hash)
    end

    def self.process_finished?(pid)
      Process.wait(pid, Process::WNOHANG).nil?
    rescue
      true # no such process = already exited
    end

    def self.kill(signal, pid)
      puts("\tsending #{signal} to delayed_job worker, pid=#{pid}")
      Process.kill(signal, pid)
    rescue Errno::ESRCH # no such process = already exited
    end

    def self.wait_for_workers_to_exit(pids, timeout_s)
      Timeout.timeout(timeout_s) do
        sleep 1 until pids.all? {|pid| process_finished?(pid)}
      end
    end

    def self.delete_pid_files(pids, pid_file_hash)
      pids.
        map {|pid| pid_file_hash[pid]}.
        compact.
        each {|pid_file| FileUtils.rm_f(pid_file)}
    rescue => exception
      puts "\tException deleting old pid files: #{exception}"
    end

    def self.pid_dir
      dashboard_dir('tmp/pids')
    end

    def self.log_dir
      dashboard_dir('log')
    end

    module ExistingWorkers
      def self.pids
        # workers is an array of [job_id, pid, pid_file] tuples
        workers = workers_from_ps_and_pid_files

        pids = workers.
          sort_by {|job_id, _, _| job_id}.
          map {|_, pid, _| pid} # pids must be ordered by job_id

        pid_file_hash = workers.to_h {|_, pid, pid_file| [pid, pid_file]}
        return pids, pid_file_hash
      end

      # Combines worker info from pid files AND ps output, needs this to be robust
      def self.workers_from_ps_and_pid_files
        workers_from_pid_files = get_workers_from_pid_files # array of [job_id, pid, pid_file] tuples
        workers_from_ps = get_workers_from_ps.map {|job_id, pid, _runtime_seconds| [job_id, pid]}

        # Start with workers_from_ps as the base, using pid_file from workers_from_pid_files if it exists
        workers = workers_from_ps.map do |job_id, pid|
          pid_file = workers_from_pid_files.find {|id, _, _| id == job_id}&.last # Find pid_file if available
          [job_id, pid, pid_file]
        end

        # Include any entries in workers_from_pid_files that aren't in workers_from_ps
        workers += workers_from_pid_files.reject {|job_id, _, _| workers_from_ps.any? {|id, _| id == job_id}}

        return workers # array of [job_id, pid, pid_file] tuples
      end

      # Returns an array of [job_id, pid, runtime_seconds] tuples for lines
      # in `ps` matching `delayed_job.<job_id>`
      def self.get_workers_from_ps
        # ps output looks like:
        # 39393 random_command_here
        # 79380 delayed_job.0
        # 79382 delayed_job.2

        # match delayed_job.<job_id> in ps output
        match_job_id = ->(cmd) {cmd[/^delayed_job\.(\d+)/, 1]&.to_i}

        # convert ps etime `dd-hh:mm:ss` to seconds
        to_seconds = lambda do |etime|
          parts = etime.split(/[:-]/).reverse.map(&:to_i) # => [seconds, minutes, hours, days]
          parts.zip([1, 60, 3600, 86_400]).sum {|value, factor| value * factor}
        end

        # Use `ps` to get a list of [job_id, pid, runtime_seconds] for processes matching `delayed_job.<job_id>`
        ps.lines.
          map(&:strip).
          map {|line| line.split(/\s+/, 3)}. # split each line of ps into three columns
          map {|pid, etime, cmd| [match_job_id[cmd], pid.to_i, to_seconds[etime]]}.
          reject {|job_id, _pid, _| job_id.nil?}. # drop lines that aren't about delayed_job
          sort_by {|job_id, _pid, _| job_id}
      end

      def self.ps
        `ps -eo pid,etime,command`
      end

      def self.etime_to_seconds(etime)
        parts = etime.split(/[:-]/).reverse.map(&:to_i)
        parts.zip([1, 60, 3600, 86_400]).sum {|value, factor| value * factor}
      end

      # Returns an array of [job_id, pid, pid_file] tuples for processes with .pid files
      def self.get_workers_from_pid_files
        Dir["#{Cdo::ActiveJobBackend.pid_dir}/delayed_job.*.pid"].
          map {|pid_file| get_worker_from_pid_file(pid_file)}.
          sort_by {|job_id, _, _| job_id}
      end

      def self.get_worker_from_pid_file(pid_file)
        job_id = pid_file[/delayed_job\.(\d+)\.pid/, 1].to_i
        pid = File.read(pid_file).to_i
        [job_id, pid, pid_file]
      end
    end
  end
end
