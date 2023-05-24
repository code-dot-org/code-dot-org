#!/usr/bin/env ruby
require_relative '../../deployment'
require 'cdo/prompt_filter'
require 'cdo/open_ai'

def command_line_options
end

def read_inputs(good_prompt_file, bad_prompt_file)
  expected_passes = File.read(good_prompt_file).split("\n")
  expected_failures = File.read(bad_prompt_file).split("\n")

  [expected_passes, expected_failures]
end

def main
  # $command_line = "#{$0} #{ARGV.join(' ')}"
  # options = command_line_options
  main_start_time = Time.now

  good_prompts = File.readlines(File.join(__dir__, 'good_prompts.txt')).map(&:chomp)
  bad_prompts = File.readlines(File.join(__dir__, 'bad_prompts.txt')).map(&:chomp) 
  puts "good_prompts: #{good_prompts}" 
  # output_file = "output.html"

  # system("mkdir -p cached_responses")
  # system("rm -f cached_responses/*") unless options[:use_cached]

  # [expected_passes, expected_failures] = read_inputs(good_prompt_file, bad_prompt_file)
  # expected_grades = get_expected_grades(expected_grades_file)

  # good_prompts.each do |prompt|
  #   response_code = PromptFilter.find_potential_content_violations(prompt)
  #   if response_code != '200'
  #     puts "Prompt '#{prompt}' expected to be good but got error."
  #   end
  # end
  
  # bad_prompts.each do |prompt|
  #   response_code = PromptFilter.find_potential_content_violations(prompt)
  #   if response_code == '200'
  #     puts "Prompt '#{prompt}' expected to be bad but got 200."
  #   end
  # end

  # Report.new.generate_html_output(
  #   output_file, prompt, rubric, overall_accuracy, actual_grades, expected_grades, options[:passing_grades], accuracy_by_criteria, errors
  # )
  puts "main finished in #{(Time.now - main_start_time).to_i} seconds"

  # system("open", output_file)
end

main if __FILE__ == $PROGRAM_NAME