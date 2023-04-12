require 'csv'
require 'json'
require 'httparty'
require 'nokogiri'
require 'open3'
require 'parallel'

def read_inputs(prompt_file, rubric_file)
  prompt = File.read(prompt_file)
  rubric = File.read(rubric_file).lines.to_a
  [prompt, rubric]
end

def get_student_files
  Dir.glob('*.js').sort
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

def grade_student_work(prompt, rubric, student_code, student_id)
  api_url = 'https://api.openai.com/v1/chat/completions'
  headers = {
    'Content-Type' => 'application/json',
    'Authorization' => "Bearer #{ENV['OPENAI_API_KEY']}"
  }
  rubric_str = rubric.join

  data = {
    model: 'gpt-4',
    temperature: 0,
    messages: [
      {role: 'system', content: prompt},
      {role: 'user', content: "Rubric:\n#{rubric_str}\n\nStudent Code:\n#{student_code}"}
    ],
  }

  start_time = Time.now
  response = HTTParty.post(api_url, headers: headers, body: data.to_json, timeout: 120)

  if response.code == 200
    puts "#{student_id} request size #{data.to_json.size} succeeded in #{(Time.now - start_time).to_i} seconds"
    completed_text = response.parsed_response['choices'][0]['message']['content']
    tsv_data = parse_tsv(completed_text.strip)
    tsv_data.map(&:to_h)
  else
    puts "#{student_id} Error calling the API: #{response.code}"
    puts "#{student_id} Response body: #{response.body}"
    []
  end
end

def compute_accuracy(expected_grades, actual_grades)
  total = 0
  matches = 0

  actual_grades.each do |student_id, criteria|
    criteria.each do |row|
      total += 1
      matches += 1 if expected_grades[student_id][row['Key Concept']] == row['Grade']
    end
  end

  (matches / total.to_f) * 100
end

def compute_cell_color(actual, expected)
  possible_grades = ["No Evidence", "Limited Evidence", "Convincing Evidence", "Extensive Evidence"]
  expected_index = possible_grades.index(expected)
  actual_index = possible_grades.index(actual)
  grade_difference = expected && actual && (expected_index - actual_index).abs
  case grade_difference
  when 0
    'green'
  when 1
    'yellow'
  else
    'red'
  end
end

def generate_html_output(output_filename, prompt, accuracy, actual_grades, expected_grades)
  link_base_url = "file://#{`pwd`.strip}"

  File.open(output_filename, 'w') do |file|
    file.puts '<!DOCTYPE html>'
    file.puts '<html lang="en">'
    file.puts '<head>'
    file.puts '  <meta charset="UTF-8">'
    file.puts '  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    file.puts '  <title>Rubric Test Results</title>'
    file.puts '</head>'
    file.puts '<body>'
    file.puts "  <h2>Prompt:</h2>"
    file.puts "  <pre>#{prompt}</pre>"
    file.puts "  <h2>Overall Accuracy: #{accuracy.to_i}%</h2>"

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
        cell_color = compute_cell_color(actual, expected)
        file.puts "    <tr><td>#{criteria}</td><td>#{expected}</td><td style=\"background-color: #{cell_color};\">#{actual}</td><td>#{reason}</td></tr>"
      end
      file.puts '  </table>'
    end

    file.puts '</body>'
    file.puts '</html>'
  end
  output_filename
end

def main
  main_start_time = Time.now
  prompt_file = 'system_prompt.txt'
  rubric_file = 'rubric.csv'
  expected_grades_file = 'expected_grades.csv'
  output_filename = ARGV[0] || 'output.html'

  prompt, rubric = read_inputs(prompt_file, rubric_file)
  student_files = get_student_files
  expected_grades = get_expected_grades(expected_grades_file)

  actual_grades = Parallel.map(student_files, in_threads: 7) do |student_file|
    student_id = File.basename(student_file, '.js')
    student_code = File.read(student_file)
    [student_id, grade_student_work(prompt, rubric, student_code, student_id)]
  end.to_h

  accuracy = compute_accuracy(expected_grades, actual_grades)
  output_file = generate_html_output(output_filename, prompt, accuracy, actual_grades, expected_grades)
  puts "main finished in #{(Time.now - main_start_time).to_i} seconds"

  system("open", output_file)
end

main if __FILE__ == $PROGRAM_NAME
