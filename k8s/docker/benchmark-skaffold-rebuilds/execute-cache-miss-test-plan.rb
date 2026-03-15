#!/usr/bin/env -S bundle exec ruby
# frozen_string_literal: true

require 'fileutils'
require 'open3'
require 'pathname'
require 'securerandom'
require 'time'

require_relative 'src/cache_miss_test_plan_support'

SCRIPT_DIR = Pathname(__dir__).realpath
REPO_ROOT = SCRIPT_DIR.parent.parent.parent
TEST_PLAN_PATH = SCRIPT_DIR / 'cache-miss-test-plan.json'
CACHE_MISS_DAILY_ODDS_PATH = SCRIPT_DIR / 'daily-odds-of-file-change.json'
RUN_ID_LENGTH = 4
BUILD_COMMAND = %w[skaffold build].freeze

def random_run_id
  SecureRandom.alphanumeric(RUN_ID_LENGTH).downcase
end

def random_payload
  "#{SecureRandom.alphanumeric(32)}\n"
end

def absolute_repo_path(relative_path)
  path = Pathname(relative_path)
  raise "modify_path must be repo-relative: #{relative_path}" if path.absolute?

  absolute_path = (REPO_ROOT / path).cleanpath
  repo_prefix = "#{REPO_ROOT}/"
  return absolute_path if absolute_path == REPO_ROOT || absolute_path.to_s.start_with?(repo_prefix)

  raise "modify_path escapes repo root: #{relative_path}"
end

def timestamped_run(command, log_path)
  FileUtils.mkdir_p(log_path.dirname)
  started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  success = false

  log_path.open('wb') do |log_file|
    Open3.popen2e(*command, chdir: REPO_ROOT.to_s) do |_stdin, combined, wait_thr|
      combined.each_line do |line|
        log_file.write("#{Time.now.iso8601} #{line}")
      end
      success = wait_thr.value.success?
    end
  end

  duration = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at
  [success, duration.round(6)]
end

def snapshot_test_dockerfiles(run_dir)
  rows = CacheMissTestPlanSupport.load_json_array(CACHE_MISS_DAILY_ODDS_PATH)
  dockerfiles = rows.map {|row| CacheMissTestPlanSupport.fetch_string(row, 'dockerfile')}.uniq.sort
  dockerfiles_dir = run_dir / 'dockerfiles'
  FileUtils.mkdir_p(dockerfiles_dir)

  dockerfiles.each do |dockerfile|
    source = REPO_ROOT / 'k8s' / 'docker' / dockerfile
    raise "missing dockerfile for snapshot: #{source}" unless source.exist?

    FileUtils.cp(source, dockerfiles_dir / dockerfile)
  end
end

def snapshot_modified_files(plan)
  snapshots = {}
  plan.each do |day|
    day.fetch('modify_paths').each do |relative_path|
      next if snapshots.key?(relative_path)

      absolute_path = absolute_repo_path(relative_path)
      snapshots[relative_path] =
        if absolute_path.exist?
          {
            existed: true,
            content: absolute_path.binread,
            mode: absolute_path.stat.mode & 0o777
          }
        else
          {
            existed: false
          }
        end
    end
  end
  snapshots
end

def write_day_modifications(day)
  day.fetch('modify_paths').each do |relative_path|
    absolute_path = absolute_repo_path(relative_path)
    FileUtils.mkdir_p(absolute_path.dirname)
    absolute_path.binwrite(random_payload)
  end
end

def remove_empty_parent_dirs(path)
  current = path.dirname
  while current.to_s.start_with?(REPO_ROOT.to_s) && current != REPO_ROOT
    break unless current.exist? && current.directory?
    break unless current.children.empty?

    current.rmdir
    current = current.dirname
  end
end

def restore_files(snapshots)
  snapshots.each do |relative_path, snapshot|
    absolute_path = absolute_repo_path(relative_path)
    if snapshot.fetch(:existed)
      FileUtils.mkdir_p(absolute_path.dirname)
      absolute_path.binwrite(snapshot.fetch(:content))
      File.chmod(snapshot.fetch(:mode), absolute_path)
    elsif absolute_path.exist?
      absolute_path.delete
      remove_empty_parent_dirs(absolute_path)
    end
  end
end

def summary_day(day_number, modify_paths, duration, log_path, success)
  {
    'day' => day_number,
    'modify_paths' => modify_paths,
    'build_time_seconds' => duration,
    'log_path' => log_path.to_s,
    'success' => success
  }
end

def main
  plan = CacheMissTestPlanSupport.load_test_plan(TEST_PLAN_PATH)
  run_id = random_run_id
  run_dir = SCRIPT_DIR / "cache-test-run-#{run_id}"
  summary_path = run_dir / "cache-test-run-#{run_id}.json"
  snapshots = snapshot_modified_files(plan)
  day_results = []
  warm_cache_build = nil

  FileUtils.mkdir_p(run_dir)
  snapshot_test_dockerfiles(run_dir)

  begin
    warm_log_path = run_dir / 'logs' / 'warm-cache' / 'skaffold-build.log'
    warm_success, warm_duration = timestamped_run(BUILD_COMMAND, warm_log_path)
    warm_cache_build = {
      'build_time_seconds' => warm_duration,
      'log_path' => warm_log_path.relative_path_from(run_dir).to_s,
      'success' => warm_success
    }

    if warm_success
      plan.each do |day|
        day_number = day.fetch('day')
        modify_paths = day.fetch('modify_paths')
        write_day_modifications(day)

        day_log_path = run_dir / 'logs' / "day#{day_number}" / 'skaffold-build.log'
        success, duration = timestamped_run(BUILD_COMMAND, day_log_path)
        day_results << summary_day(
          day_number,
          modify_paths,
          duration,
          day_log_path.relative_path_from(run_dir),
          success
        )
        break unless success
      end
    end
  ensure
    restore_files(snapshots)
  end

  summary = {
    'run_id' => run_id,
    'days_tested' => day_results.length,
    'total_build_time_seconds' => day_results.sum {|day| day.fetch('build_time_seconds')}.round(6),
    'warm_cache_build' => warm_cache_build,
    'days' => day_results,
    'cache_miss_test_plan' => plan
  }

  CacheMissTestPlanSupport.write_pretty_json(summary_path, summary)
  puts JSON.pretty_generate(summary)
end

main if $PROGRAM_NAME == __FILE__
