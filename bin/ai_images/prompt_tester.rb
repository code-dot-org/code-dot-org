#!/usr/bin/env ruby
require 'json'
require 'digest'
require 'fileutils'
require_relative '../../deployment'
# require 'cdo/prompt_filter'
require 'cdo/open_ai'
require_relative './report.rb'

def command_line_options
  options = {}

  OptionParser.new do |opts|
    opts.on(
      '-c', '--use-cached', 'Use cached responses from the API.',
      'This can be useful when debugging a problem with the tool,',
      'or if one of the API requests failed in the previous run.'
    ) do
      options[:use_cached] = true
    end

    opts.on(
      '-s', '--save-responses', 'Save responses from the API.',
      'This can enable future developers to debug a problem with the tool,'
    ) do
      options[:save_responses] = true
    end

    opts.on(
      '-d', '--dry-run', 'Disables requests to open API'
    ) do
      options[:dry_run] = true
    end
  end.parse!
  puts "Using options: " + options.to_json
  options
end

def update_progress(message)
  puts message
end

def read_inputs(expected_successes_filename, expected_failures_filename)
  expected_successes_path = get_absolute_path(expected_successes_filename)
  expected_failures_path = get_absolute_path(expected_failures_filename)

  update_progress("Reading expected_successes from #{expected_successes_path}")
  expected_successes = File.exist?(expected_successes_path) ? File.readlines(expected_successes_path).map(&:chomp) : []
  update_progress("Reading expected_failures from #{expected_failures_path}")
  expected_failures = File.exist?(expected_failures_path) ? File.readlines(expected_failures_path).map(&:chomp) : []

  [expected_successes, expected_failures]
end

def get_absolute_path(relative_path)
  File.expand_path(relative_path, File.dirname(__FILE__))
end

def get_content_violations(system_prompt, student_prompts, options)
  json_string = JSON.generate(student_prompts)
  unique_id = Digest::SHA1.hexdigest(json_string)
  puts "Unique ID: #{unique_id}"
  path = get_absolute_path("cached_responses/#{unique_id}.json")

  if options[:use_cached] && File.exist?(path)
    puts "Using cached response from #{path}"
    cached_response = File.read(path)
    cached_json_data = JSON.parse(cached_response)
    return cached_json_data
  end

    begin 
      # Set read timeout to N seconds -- wait an extra long time for prompt_tester
      update_progress("Sending prompts to OpenAI -- this is expected to take a while, especially if your system prompt is highly specific!")
      response = OpenAI.gpt(system_prompt, json_string, 300)
      data = JSON.parse(response)
      puts "Options: #{options}"
      puts "Path: #{path}"
      File.write(path, JSON.pretty_generate(data)) if options[:save_responses]
      puts "JSON data written to file: #{path}"
      return data
    rescue Exception => e
      puts "Error: #{e.message}"
      exit 1
    end
end

def main
  $command_line = "#{$0} #{ARGV.join(' ')}"
  options = command_line_options
  main_start_time = Time.now
  output_file = get_absolute_path("results.html")

  FileUtils.mkdir_p(get_absolute_path("cached_responses"))

  system_prompt = File.read(get_absolute_path('system_prompt.txt'))
  expected_successes, expected_failures = read_inputs('expected_successes.txt', 'expected_failures.txt')

  update_progress("Checking for content violations on #{expected_successes.length} good prompts")
  expected_successes_results = get_content_violations(system_prompt, expected_successes, options)
  expected_failures_results = get_content_violations(system_prompt, expected_failures, options)

  update_progress("Generating HTML output in #{output_file}")
  Report.new.generate_html_output(
    output_file, system_prompt, expected_successes_results, expected_failures_results
  )
  puts "main finished in #{(Time.now - main_start_time).to_i} seconds"
end

main if __FILE__ == $PROGRAM_NAME