#!/usr/bin/env -S bundle exec ruby
# frozen_string_literal: true

require 'fileutils'
require 'optparse'
require 'open3'
require 'pathname'
require 'securerandom'
require 'time'

require_relative 'src/cache_miss_test_plan_support'
require_relative 'src/docker_image_inspect_size'

SCRIPT_DIR = Pathname(__dir__).realpath
REPO_ROOT = SCRIPT_DIR.parent.parent.parent
TEST_PLAN_PATH = SCRIPT_DIR / 'test-plan.json'
CACHE_MISS_DAILY_ODDS_PATH = SCRIPT_DIR / 'daily-odds-of-file-change.json'
BUILD_COMMAND = %w[skaffold build].freeze
TARGET_IMAGE_NAME = 'code-dot-org'
SKAFFOLD_BUILD_TAGS_FILENAME = 'skaffold-build-tags.json'

def parse_options
  options = {}

  OptionParser.new do |parser|
    parser.banner = 'Usage: run-test-plan.rb --description=TEXT'
    parser.on('--description=TEXT', 'Short description of this benchmark run') do |description|
      stripped = description.strip
      raise OptionParser::InvalidArgument, 'description must not be empty' if stripped.empty?

      options[:description] = stripped
    end
  end.parse!

  raise OptionParser::MissingArgument, '--description=TEXT is required' unless options.key?(:description)

  options
end

def formatted_run_datestamp(time = Time.now)
  [
    time.strftime('%b').downcase,
    time.day,
    time.year,
    time.strftime('%-I%M%P')
  ].join('-')
end

def unique_run_datestamp
  base = formatted_run_datestamp
  suffix = 2
  candidate = base

  while (SCRIPT_DIR / "test-run-#{candidate}").exist?
    candidate = "#{base}-#{suffix}"
    suffix += 1
  end

  candidate
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
        print line
        $stdout.flush
      end
      success = wait_thr.value.success?
    end
  end

  duration = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at
  [success, duration.round(6)]
end

def build_command(run_tag, file_output_path = nil)
  command = BUILD_COMMAND + ['--tag', run_tag]
  return command unless file_output_path

  command + ['--file-output', file_output_path.to_s]
end

def write_day_results_json(day_dir, success, skaffold_build_tags_path)
  payload = DockerImageInspectSize.payload(
    repo_root: REPO_ROOT,
    image_name: TARGET_IMAGE_NAME,
    success: success,
    skaffold_build_tags_path: skaffold_build_tags_path
  )

  CacheMissTestPlanSupport.write_pretty_json(day_dir / 'docker-image-inspect-size.json', payload)
  payload
end

def print_final_docker_image_size(image_inspect_payload)
  size_gb = image_inspect_payload&.fetch('docker_inspect_size_gigabytes', nil)
  return unless size_gb

  puts format('Docker image size: %.6f GB', size_gb)
end

def print_day_summary_lines(day_results, run_dir)
  return if day_results.empty?

  puts
  day_results.each do |day|
    log_path = (run_dir / day.fetch('log_path')).relative_path_from(SCRIPT_DIR)
    size_gb = day.fetch('docker_inspect_size_gigabytes')
    size_text = size_gb.nil? ? 'n/a GB' : format('%.6f GB', size_gb)
    image_ref = day.fetch('docker_image_reference')
    puts "Day #{day.fetch('day')} build time: #{day.fetch('build_time_minutes')} minutes, #{size_text}, #{log_path}, #{image_ref}"
  end
  puts
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

def summary_day(day_number, modify_paths, duration, log_path, success, image_inspect_payload)
  {
    'day' => day_number,
    'modify_paths' => modify_paths,
    'build_time_minutes' => (duration / 60.0).round(6),
    'log_path' => log_path.to_s,
    'success' => success
  }.merge(image_inspect_payload)
end

def format_hours_and_minutes(duration_minutes)
  format('%.2f hrs (%.2f minutes)', duration_minutes / 60.0, duration_minutes)
end

def build_summary(run_datestamp:, description:, day_results:, warm_cache_build:, run_dir:, summary_path:, error:)
  total_build_time_minutes = day_results.sum {|day| day.fetch('build_time_minutes')}
  last_day = day_results.last
  {
    'run_datestamp' => run_datestamp,
    'description' => description,
    'run_directory' => run_dir.to_s,
    'results_json_path' => summary_path.to_s,
    'days_tested' => day_results.length,
    'total_build_time_minutes' => total_build_time_minutes.round(6),
    'docker_image_reference' => last_day&.fetch('docker_image_reference', nil),
    'warm_cache_build' => warm_cache_build,
    'days' => day_results,
    'error' => error
  }
end

def write_summary_json(summary_path, summary)
  CacheMissTestPlanSupport.write_pretty_json(summary_path, summary)
end

def print_day_header(day_number, modify_paths)
  puts
  puts
  puts '=' * 80
  puts "STARTING DAY #{day_number}"
  puts 'Paths to modify:'
  if modify_paths.empty?
    puts '  (none)'
  else
    modify_paths.each do |path|
      puts "  - #{path}"
    end
  end
  puts '=' * 80
  puts
  puts
end

def print_day_result(day_number, duration, success)
  duration_text = format_hours_and_minutes((duration / 60.0).round(6))
  puts
  puts
  puts '*' * 80
  puts "FINISHED DAY #{day_number}: #{duration_text}"
  puts "Status: #{success ? 'success' : 'failed'}"
  puts '*' * 80
  puts
  puts
end

def main
  options = parse_options
  plan = CacheMissTestPlanSupport.load_test_plan(TEST_PLAN_PATH)
  run_datestamp = unique_run_datestamp
  run_dir = SCRIPT_DIR / "test-run-#{run_datestamp}"
  run_tag = run_dir.basename.to_s
  run_test_plan_path = run_dir / TEST_PLAN_PATH.basename
  description_path = run_dir / 'description.txt'
  summary_path = run_dir / "test-run-#{run_datestamp}.json"
  snapshots = snapshot_modified_files(plan)
  day_results = []
  warm_cache_build = nil
  last_image_inspect_payload = nil
  run_error = nil

  FileUtils.mkdir_p(run_dir)
  CacheMissTestPlanSupport.write_pretty_json(run_test_plan_path, plan)
  description_path.write(options.fetch(:description) + "\n")
  snapshot_test_dockerfiles(run_dir)
  write_summary_json(
    summary_path,
    build_summary(
      run_datestamp: run_datestamp,
      description: options.fetch(:description),
      day_results: day_results,
      warm_cache_build: warm_cache_build,
      run_dir: run_dir,
      summary_path: summary_path,
      error: run_error
    )
  )

  begin
    warm_log_path = run_dir / 'logs' / 'warm-cache' / 'skaffold-build.log'
    warm_success, warm_duration = timestamped_run(build_command(run_tag), warm_log_path)
    warm_cache_build = {
      'build_time_minutes' => (warm_duration / 60.0).round(6),
      'log_path' => warm_log_path.relative_path_from(run_dir).to_s,
      'success' => warm_success
    }
    write_summary_json(
      summary_path,
      build_summary(
        run_datestamp: run_datestamp,
        description: options.fetch(:description),
        day_results: day_results,
        warm_cache_build: warm_cache_build,
        run_dir: run_dir,
        summary_path: summary_path,
        error: run_error
      )
    )

    if warm_success
      plan.each do |day|
        day_number = day.fetch('day')
        modify_paths = day.fetch('modify_paths')
        print_day_header(day_number, modify_paths)
        write_day_modifications(day)

        day_dir = run_dir / 'logs' / "day#{day_number}"
        day_log_path = day_dir / 'skaffold-build.log'
        day_skaffold_build_tags_path = day_dir / SKAFFOLD_BUILD_TAGS_FILENAME
        success, duration = timestamped_run(build_command(run_tag, day_skaffold_build_tags_path), day_log_path)
        last_image_inspect_payload = write_day_results_json(day_dir, success, day_skaffold_build_tags_path)
        print_day_result(day_number, duration, success)
        day_results << summary_day(
          day_number,
          modify_paths,
          duration,
          day_log_path.relative_path_from(run_dir),
          success,
          last_image_inspect_payload
        )
        write_summary_json(
          summary_path,
          build_summary(
            run_datestamp: run_datestamp,
            description: options.fetch(:description),
            day_results: day_results,
            warm_cache_build: warm_cache_build,
            run_dir: run_dir,
            summary_path: summary_path,
            error: run_error
          )
        )
        break unless success
      end
    end
  rescue StandardError => exception
    run_error = exception.message
    raise
  ensure
    restore_files(snapshots)
    write_summary_json(
      summary_path,
      build_summary(
        run_datestamp: run_datestamp,
        description: options.fetch(:description),
        day_results: day_results,
        warm_cache_build: warm_cache_build,
        run_dir: run_dir,
        summary_path: summary_path,
        error: run_error
      )
    )
  end

  summary = build_summary(
    run_datestamp: run_datestamp,
    description: options.fetch(:description),
    day_results: day_results,
    warm_cache_build: warm_cache_build,
    run_dir: run_dir,
    summary_path: summary_path,
    error: run_error
  )

  puts JSON.pretty_generate(summary)
  print_day_summary_lines(day_results, run_dir)
  puts "Total build time: #{format_hours_and_minutes(summary.fetch('total_build_time_minutes'))}"
  print_final_docker_image_size(last_image_inspect_payload)
  puts "Test run directory: #{run_dir.relative_path_from(SCRIPT_DIR)}"
  puts "Results JSON: #{summary_path.relative_path_from(SCRIPT_DIR)}"
end

main if $PROGRAM_NAME == __FILE__
