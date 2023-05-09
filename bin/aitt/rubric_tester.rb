#!/usr/bin/env ruby

require 'csv'
require 'json'
require 'httparty'
require 'nokogiri'
require 'open3'
require 'parallel'
require 'optparse'

VALID_GRADES = ["Extensive Evidence", "Convincing Evidence", "Limited Evidence", "No Evidence"]

def command_line_options
  options = {
    output_filename: 'report.html'
  }
  OptionParser.new do |opts|
    opts.banner = "Usage: #{$0} [options]"

    opts.on(
      '-o', '--output_filename FILENAME', String, 'Output filename within output directory'
    ) do |output_filename|
      options[:output_filename] = output_filename
    end

    opts.on(
      '-c', '--use_cached', 'Use cached responses from the API.',
      'This can be useful when debugging a problem with the tool,',
      'or if one of the API requests failed in the previous run.'
    ) do
      options[:use_cached] = true
    end

    opts.on(
      '-p', '--num_passing_grades N', Integer, 'Number of grades which are considered passing.',
      'If specified, report based on whether the pass/fail result is accurate for each criteria.',
      'For example, N=2 means that Extensive Evidence and Convincing Evidence are both passing.'
    ) do |num_passing_grades|
      options[:passing_grades] = VALID_GRADES[0...num_passing_grades]
    end

    opts.on("-h", "--help", "Prints this help message") do
      puts opts
      exit
    end
  end.parse!
  options
end

def read_inputs(prompt_file, rubric_file)
  prompt = File.read(prompt_file)
  rubric = File.read(rubric_file)
  [prompt, rubric]
end

def get_student_files
  Dir.glob('sample_code/*.js').sort
end

def get_expected_grades(expected_grades_file)
  expected_grades = {}
  CSV.foreach(expected_grades_file, headers: true) do |row|
    student_id = row['student']
    expected_grades[student_id] = row.to_h
  end
  expected_grades
end

def parse_tsv(tsv_text)
  rows = tsv_text.split("\n")
  header = rows.shift.split("\t")
  rows.map {|row| Hash[header.zip(row.split("\t"))]}
end

def validate_server_response(tsv_data, rubric)
  expected_columns = ["Key Concept", "Grade", "Reason"]

  # Get the list of key concepts from the rubric
  rubric_key_concepts = CSV.parse(rubric, headers: true).map {|row| row['Key Concept']}.uniq

  # 1. The response represents a table in TSV format
  return [false, 'invalid format'] unless tsv_data.is_a?(Array)

  # 2. The table's column names are "Key Concept", "Grade", and "Reason"
  return [false, 'incorrect column names'] unless tsv_data.all? {|row| (row.keys & expected_columns) == expected_columns}

  # 3. The Key Concept column contains one entry for each Key Concept listed in the rubric
  key_concepts_from_response = tsv_data.map {|row| row["Key Concept"]}.uniq
  return [false, 'invalid or missing key concept'] unless rubric_key_concepts.sort == key_concepts_from_response.sort

  # 4. All entries in the Grade column are one of the valid values
  return [false, 'invalid grade value'] unless tsv_data.all? {|row| VALID_GRADES.include?(row["Grade"])}

  [true, nil]
end

def grade_student_work(prompt, rubric, student_code, student_id, use_cached: false)
  if use_cached && File.exist?("cached_responses/#{student_id}.txt")
    cached_response = File.read("cached_responses/#{student_id}.txt")
    tsv_data = parse_tsv(cached_response.strip)
    return tsv_data.map(&:to_h)
  end

  api_url = 'https://api.openai.com/v1/chat/completions'
  headers = {
    'Content-Type' => 'application/json',
    'Authorization' => "Bearer #{ENV['OPENAI_API_KEY']}"
  }

  data = {
    model: 'gpt-4',
    temperature: 0,
    messages: [
      {role: 'system', content: prompt},
      {role: 'user', content: "Rubric:\n#{rubric}\n\nStudent Code:\n#{student_code}"}
    ],
  }

  start_time = Time.now
  response = HTTParty.post(api_url, headers: headers, body: data.to_json, timeout: 120)

  if response.code == 200
    tokens = response.parsed_response['usage']['total_tokens']
    puts "#{student_id} request succeeded in #{(Time.now - start_time).to_i} seconds. #{tokens} tokens used."
    completed_text = response.parsed_response['choices'][0]['message']['content']
    tsv_data = parse_tsv(completed_text.strip)
    valid, reason = validate_server_response(tsv_data, rubric)
    if valid
      File.write("cached_responses/#{student_id}.txt", completed_text)
      tsv_data.map(&:to_h)
    else
      puts "#{student_id} Invalid api response: #{reason}\n#{completed_text}}"
      nil
    end
  else
    puts "#{student_id} Error calling the API: #{response.code}"
    puts "#{student_id} Response body: #{response.body}"
    nil
  end
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

def compute_pass_fail_cell_color(expected, actual, passing_grades)
  if accurate?(expected, actual, passing_grades)
    'green'
  else
    'red'
  end
end

# compute color for a cell in the "actual grade" column
# based on the difference between the expected grade and the actual grade
def compute_actual_cell_color(actual, expected, passing_grades)
  return compute_pass_fail_cell_color(expected, actual, passing_grades) if passing_grades

  expected_index = VALID_GRADES.index(expected)
  actual_index = VALID_GRADES.index(actual)
  grade_difference = expected_index && actual_index && (expected_index - actual_index).abs
  case grade_difference
  when 0
    'green'
  when 1
    'yellow'
  else
    'red'
  end
end

def rubric_to_html_table(rubric)
  parsed_rubric = CSV.parse(rubric)
  header_row = parsed_rubric.shift

  header_html = header_row.map {|header| "<th>#{header}</th>"}.join
  rows_html = parsed_rubric.map {|row| "<tr>#{row.map {|cell| "<td>#{cell}</td>"}.join}</tr>"}.join

  <<-HTML
    <table border="1">
      <thead>
        <tr>#{header_html}</tr>
      </thead>
      <tbody>
        #{rows_html}
      </tbody>
    </table>
  HTML
end

# compute color for a cell in the accuracy table based on the accuracy percentage
def calculate_accuracy_color(percentage)
  intensity = ((percentage - 50) * 5.1).to_i
  if percentage >= 50
    "rgb(#{255 - intensity}, 255, #{255 - intensity})"
  else
    "rgb(255, #{intensity + 200}, #{intensity + 200})"
  end
end

def generate_accuracy_table(accuracy_by_criteria)
  accuracy_table = '<table border="1">'
  accuracy_table << '<tr><th>Key Concept</th><th>Accuracy</th></tr>'
  accuracy_by_criteria.each do |criteria, accuracy|
    color = calculate_accuracy_color(accuracy)
    accuracy_table << "<tr><td>#{criteria}</td><td style=\"background-color: #{color};\">#{accuracy.to_i}%</td></tr>"
  end
  accuracy_table << '</table>'
  accuracy_table
end

def generate_html_output(output_file, prompt, rubric, accuracy, actual_grades, expected_grades, passing_grades, accuracy_by_criteria, errors)
  link_base_url = "file://#{`pwd`.strip}/sample_code"

  File.open(output_file, 'w') do |file|
    file.puts '<!DOCTYPE html>'
    file.puts '<html lang="en">'
    file.puts '<head>'
    file.puts '  <meta charset="UTF-8">'
    file.puts '  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    file.puts '  <title>Rubric Test Results</title>'
    file.puts '</head>'
    file.puts '<body style="-webkit-print-color-adjust: exact;">'
    file.puts "  <h2>Prompt:</h2>"
    file.puts "  <pre>#{prompt}</pre>"
    file.puts "  <h2>Rubric:</h2>"
    file.puts rubric_to_html_table(rubric)
    if errors.count > 0
      file.puts "  <h2 style=\"color: red\">Errors: #{errors.count}</h2>"
      file.puts "  <p style=\"color: red\">#{errors.join(', ')} failed to load</p>"
    end

    file.puts "  <h2>Command Line:</h2>"
    file.puts "  <p><pre>#{$command_line}</pre><\p>"

    file.puts "  <h2>Overall Accuracy: #{accuracy.to_i}%</h2>"
    file.puts "  <h2>Accuracy by Key Concept:</h2>"
    file.puts generate_accuracy_table(accuracy_by_criteria)

    file.puts "  <h2>Grades by student:</h2>"
    actual_grades.each do |student_id, grades|
      file.puts "  <h3>Student: #{student_id}</h3>"
      file.puts "  <a href=\"#{link_base_url}/#{student_id}.js\">#{student_id}.js</a>"
      file.puts '  <table border="1">'
      file.puts '    <tr><th>Criteria</th><th>Expected Grade</th><th>Actual Grade</th><th>Reason</th></tr>'
      grades.each do |grade|
        criteria = grade['Key Concept']
        expected = expected_grades[student_id][criteria]
        actual = grade['Grade']
        reason = grade['Reason']
        cell_color = compute_actual_cell_color(actual, expected, passing_grades)
        file.puts "    <tr><td>#{criteria}</td><td>#{expected}</td><td style=\"background-color: #{cell_color};\">#{actual}</td><td>#{reason}</td></tr>"
      end
      file.puts '  </table>'
    end

    file.puts '</body>'
    file.puts '</html>'
  end
end

def main
  $command_line = "#{$0} #{ARGV.join(' ')}"
  options = command_line_options
  main_start_time = Time.now
  prompt_file = 'system_prompt.txt'
  rubric_file = 'rubric.csv'
  expected_grades_file = 'expected_grades.csv'
  output_file = "output/#{options[:output_filename]}"

  system("mkdir -p cached_responses")

  prompt, rubric = read_inputs(prompt_file, rubric_file)
  student_files = get_student_files
  expected_grades = get_expected_grades(expected_grades_file)

  actual_grades = Parallel.map(student_files, in_threads: 7) do |student_file|
    student_id = File.basename(student_file, '.js')
    student_code = File.read(student_file)
    [student_id, grade_student_work(prompt, rubric, student_code, student_id, use_cached: options[:use_cached])]
  end

  # skip students with invalid api response
  errors = actual_grades.reject(&:last).map(&:first)
  actual_grades = actual_grades.select(&:last).to_h

  accuracy_by_criteria, overall_accuracy = compute_accuracy(expected_grades, actual_grades, options[:passing_grades])
  generate_html_output(
    output_file, prompt, rubric, overall_accuracy, actual_grades, expected_grades, options[:passing_grades], accuracy_by_criteria, errors
  )
  puts "main finished in #{(Time.now - main_start_time).to_i} seconds"

  system("open", output_file)
end

main if __FILE__ == $PROGRAM_NAME
