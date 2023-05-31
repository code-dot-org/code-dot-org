#!/usr/bin/env ruby

require 'csv'
require 'json'
require 'httparty'
require 'parallel'
require 'optparse'

require_relative './grade'
require_relative './report'

VALID_GRADES = ["Extensive Evidence", "Convincing Evidence", "Limited Evidence", "No Evidence"]

def command_line_options
  options = {
    output_filename: 'report.html',
    max_num_students: 100
  }
  OptionParser.new do |opts|
    opts.banner = "Usage: #{$0} [options]"

    opts.on(
      '-o', '--output-filename FILENAME', String, 'Output filename within output directory'
    ) do |output_filename|
      options[:output_filename] = output_filename
    end

    opts.on(
      '-c', '--use-cached', 'Use cached responses from the API.',
      'This can be useful when debugging a problem with the tool,',
      'or if one of the API requests failed in the previous run.'
    ) do
      options[:use_cached] = true
    end

    opts.on(
      '-l', '--llm-model MODEL_NAME', String, "Reserved. Which LLM model to use. Currently GPT-4, but could include other LLMs in the future."
    ) do
      options[:llm_model] = 'gpt-4'
    end

    opts.on(
      '-m', '--merge', 'Use merge map file to merge ai rubric rows into teacher rubric rows.'
    ) do
      options[:merge] = true
    end

    opts.on(
      '-p', '--num-passing-grades N', Integer, 'Number of grades which are considered passing.',
      'If specified, report based on whether the pass/fail result is accurate for each criteria.',
      'For example, N=2 means that Extensive Evidence and Convincing Evidence are both passing.'
    ) do |num_passing_grades|
      options[:passing_grades] = VALID_GRADES[0...num_passing_grades]
    end

    opts.on(
      '-s', '--max-num-students NUM', Integer, 'Maximum number of students to grade. Defaults to 100 students.'
    ) do |max_num_students|
      options[:max_num_students] = max_num_students
    end

    opts.on(
      '--student-ids STUDENT_1,STUDENT_2', Array, 'Comma-separated list of student ids to grade. Defaults to all students.'
    ) do |student_ids|
      options[:student_ids] = student_ids
    end

    opts.on("-h", "--help", "Prints this help message") do
      puts opts
      exit
    end
  end.parse!
  options
end

def read_inputs(prompt_file, standard_rubric_file, split_rubric_file, merge_map_file)
  prompt = File.read(prompt_file)
  standard_rubric = File.read(standard_rubric_file)
  split_rubric = File.read(split_rubric_file)
  merge_map = File.exist?(merge_map_file) ? File.read(merge_map_file) : nil

  [prompt, standard_rubric, split_rubric, merge_map]
end

def get_student_files(max_num_students:, student_ids: nil)
  if student_ids
    student_ids.map {|student_id| "sample_code/#{student_id}.js"}
  else
    Dir.glob('sample_code/*.js').sort.take(max_num_students)
  end
end

def get_expected_grades(expected_grades_file)
  expected_grades = {}
  CSV.foreach(expected_grades_file, headers: true) do |row|
    student_id = row['student']
    expected_grades[student_id] = row.to_h
  end
  expected_grades
end

def get_examples
  example_js_files = Dir.glob('examples/*.js').sort
  example_js_files.map do |example_js_file|
    example_id = File.basename(example_js_file, '.js')
    example_code = File.read(example_js_file)
    example_rubric = File.read("examples/#{example_id}.tsv")
    [example_code, example_rubric]
  end
end

def validate_rubrics(expected_grades, standard_rubric, split_rubric, merge_map, options)
  expected_concepts = expected_grades.values.first.keys[1..].sort

  if options[:merge]
    raise "missing merge map" if options[:merge] && merge_map.nil?

    split_concepts = CSV.parse(split_rubric, headers: true).map {|row| row['Key Concept']}.sort
    merge_concepts = CSV.parse(merge_map, headers: true).map {|row| row['Split Key Concept']}.sort
    raise "merge map split concepts do not match split concepts:\n#{merge_concepts}\n#{split_concepts}" unless merge_concepts == split_concepts

    merge_concepts = CSV.parse(merge_map, headers: true).map {|row| row['Original Key Concept']}.sort.uniq
    raise "merge map standard concepts do not match expected concepts:\n#{merge_concepts}\n#{expected_concepts}" unless merge_concepts == expected_concepts
  else
    standard_concepts = CSV.parse(standard_rubric, headers: true).map {|row| row['Key Concept']}.sort
    raise "standard concepts do not match expected concepts:\n#{standard_concepts}\n#{expected_concepts}" unless standard_concepts == expected_concepts
  end
end

def validate_students(student_files, expected_grades)
  expected_students = expected_grades.keys.sort
  actual_students = student_files.map {|student_file| File.basename(student_file, '.js')}.sort

  unexpected_students = actual_students - expected_students
  raise "unexpected students: #{unexpected_students}" unless unexpected_students.empty?
end

# Given an array of grade rows:
# [
#   {
#     "Key Concept": "Multiple Sprites - Creation",
#     "Grade": "Extensive Evidence",
#     "Reason": "..."
#   },
#   {
#     "Key Concept": "Multiple Sprites - Updated Properties",
#     "Grade": "Convincing Evidence",
#     "Reason": "..."
#   }
# ]
# merge the grade rows into a single row hash with the following properties:
#   "Key Concept" is the original concept
#   "Grade" is the lowest grade
#   "Reason" is the concatenation of the original rows, joined by formatting and newlines
def merge_grade_rows(grade_rows, original_concept)
  {
    "Key Concept" => original_concept,
    "Grade" => grade_rows.map {|row| row['Grade']}.max_by {|grade| VALID_GRADES.index(grade)},
    "Reason" => grade_rows.map {|row| "#{row['Key Concept']}: <b>#{row['Grade']}</b>. #{row['Reason']}"}.join("<br>")
  }
end

# For each original key concept, the student has been graded on a set of "split"
# key concepts which together indicate how well they did on the original
# concept. This method merges the split key concepts with the other split
# concepts corresponding to the same original key concept.
#   original_concepts: an array of the original key concepts
#   actual_grades: a hash mapping student ids to an array of grade rows, with one row for each split key concept
#   merge_map: a CSV string mapping split key concepts to original key concepts
def merge_grades(original_concepts, actual_grades, merge_map)
  merge_map = CSV.parse(merge_map, headers: true).map(&:to_h)

  actual_grades.map do |student_id, grades|
    merged_grade_rows = original_concepts.map do |original_concept|
      split_concepts = merge_map.select {|row| row['Original Key Concept'] == original_concept}.map {|row| row['Split Key Concept']}
      grade_rows_to_merge = grades.select {|grade_row| split_concepts.include?(grade_row['Key Concept'])}
      merge_grade_rows(grade_rows_to_merge, original_concept)
    end
    [student_id, merged_grade_rows]
  end.to_h
end

def accurate?(expected_grade, actual_grade, passing_grades)
  return expected_grade == actual_grade unless passing_grades

  passing_grades.include?(expected_grade) == passing_grades.include?(actual_grade)
end

def compute_accuracy(expected_grades, actual_grades, passing_grades)
  overall_total = 0
  overall_matches = 0
  matches_by_criteria = {}
  total_by_criteria = {}

  actual_grades.each do |student_id, student|
    student.each do |row|
      criteria = row['Key Concept']
      total_by_criteria[criteria] ||= 0
      total_by_criteria[criteria] += 1
      overall_total += 1

      next unless accurate?(expected_grades[student_id][criteria], row['Grade'], passing_grades)

      matches_by_criteria[criteria] ||= 0
      matches_by_criteria[criteria] += 1
      overall_matches += 1
    end
  end

  accuracy_by_criteria = {}
  total_by_criteria.each do |criteria, total|
    matches = matches_by_criteria[criteria] || 0
    accuracy_by_criteria[criteria] = (matches / total.to_f) * 100
  end

  overall_accuracy = (overall_matches / overall_total.to_f) * 100

  [accuracy_by_criteria, overall_accuracy]
end

def main
  $command_line = "#{$0} #{ARGV.join(' ')}"
  options = command_line_options

  main_start_time = Time.now
  prompt_file = 'system_prompt.txt'
  standard_rubric_file = 'standard_rubric.csv'
  split_rubric_file = 'split_rubric.csv'
  merge_map_file = 'merge_map.csv'
  expected_grades_file = 'expected_grades.csv'
  output_file = "output/#{options[:output_filename]}"

  system("mkdir -p cached_responses")
  system("rm -f cached_responses/*") unless options[:use_cached]

  prompt, standard_rubric, split_rubric, merge_map = read_inputs(prompt_file, standard_rubric_file, split_rubric_file, merge_map_file)
  student_files = get_student_files(max_num_students: options[:max_num_students].to_i, student_ids: options[:student_ids])
  expected_grades = get_expected_grades(expected_grades_file)
  examples = get_examples

  validate_rubrics(expected_grades, standard_rubric, split_rubric, merge_map, options)
  validate_students(student_files, expected_grades)

  rubric = options[:merge] ? split_rubric : standard_rubric

  actual_grades = Parallel.map(student_files, in_threads: 7) do |student_file|
    student_id = File.basename(student_file, '.js')
    student_code = File.read(student_file)
    [student_id, Grade.new.grade_student_work(prompt, rubric, student_code, student_id, use_cached: options[:use_cached], examples: examples)]
  end

  # skip students with invalid api response
  errors = actual_grades.reject(&:last).map(&:first)
  actual_grades = actual_grades.select(&:last).to_h

  if options[:merge]
    original_concepts = expected_grades.values.first.keys[1..].sort
    actual_grades = merge_grades(original_concepts, actual_grades, merge_map)
  end

  accuracy_by_criteria, overall_accuracy = compute_accuracy(expected_grades, actual_grades, options[:passing_grades])
  Report.new.generate_html_output(
    output_file, prompt, rubric, overall_accuracy, actual_grades, expected_grades, options[:passing_grades], accuracy_by_criteria, errors
  )
  puts "main finished in #{(Time.now - main_start_time).to_i} seconds"

  system("open", output_file)
end

main if __FILE__ == $PROGRAM_NAME
