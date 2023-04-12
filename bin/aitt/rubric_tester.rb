require 'csv'
require 'json'
require 'httparty'
require 'nokogiri'
require 'open3'

def read_inputs(prompt_file, example_code_file, rubric_file)
  prompt = File.read(prompt_file)
  example_code = File.read(example_code_file)
  rubric = File.read(rubric_file).lines.to_a
  [prompt, example_code, rubric]
end

def get_student_files(example_code_file)
  all_js_files = Dir.glob('*.js').sort
  all_js_files.reject { |filename| filename == example_code_file }
end

def get_expected_grades(expected_grades_file)
  expected_grades = {}
  CSV.foreach(expected_grades_file, headers: true) do |row|
    student_id = row['StudentID']
    expected_grades[student_id] = row.to_h
  end
  expected_grades
end

def grade_student_work(prompt, example_code, rubric, student_code)
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
      {role: 'user', content: "Example Code:\n#{example_code}\n\nRubric:\n#{rubric_str}\n\nStudent Code:\n#{student_code}"}
    ],
  }

  response = HTTParty.post(api_url, headers: headers, body: data.to_json)

  if response.code == 200
    completed_text = response.parsed_response['choices'][0]['message']['content']
    CSV.parse(completed_text.strip, headers: true).map(&:to_h)
  else
    puts "Error calling the API: #{response.code}"
    []
  end
end

def compute_accuracy(expected_grades, actual_grades)
  total = 0
  matches = 0

  actual_grades.each do |student_id, criteria|
    criteria.each do |row|
      total += 1
      matches += 1 if expected_grades[student_id][row['criteria']] == row['grade']
    end
  end

  (matches / total.to_f) * 100
end

def generate_html_output(output_filename, prompt, accuracy, actual_grades, expected_grades)
  builder = Nokogiri::HTML::Builder.new do |doc|
    doc.html {
      doc.head {
        doc.title 'Grading Results'
      }
      doc.body {
        doc.h1 'Grading Results'
        doc.h3 "System Prompt: #{prompt}"
        doc.h3 "Overall Accuracy: #{accuracy.round(2)}%"

        actual_grades.each do |student_id, criteria|
          doc.h3 "Student ID: #{student_id}"
          doc.table(border: '1') {
            doc.tr {
              doc.th 'Criteria'
              doc.th 'Expected Grade'
              doc.th 'Actual Grade'
              doc.th 'Reason'
            }
            criteria.each do |row|
              expected_grade = expected_grades[student_id][row['criteria']]
              cell_color = expected_grade == row['grade'] ? 'green' : 'red'
              doc.tr {
                doc.td row['criteria']
                doc.td expected_grade
                doc.td(style: "background-color: #{cell_color};") {
                  doc.text row['grade']
                }
                doc.td row['reason']
              }
            end
          }
          doc.br
        end

      }
    }
  end

  File.write(output_filename, builder.to_html)

  output_filename
end

def main
  prompt_file = 'system_prompt.txt'
  example_code_file = 'example_code.js'
  rubric_file = 'rubric.csv'
  expected_grades_file = 'expected_grades.csv'
  output_filename = ARGV[0] || 'output.html'

  prompt, example_code, rubric = read_inputs(prompt_file, example_code_file, rubric_file)
  student_files = get_student_files(example_code_file)
  expected_grades = get_expected_grades(expected_grades_file)

  actual_grades = {}
  student_files.each do |student_file|
    student_id = File.basename(student_file, '.js')
    student_code = File.read(student_file)
    actual_grades[student_id] = grade_student_work(prompt, example_code, rubric, student_code)
  end

  accuracy = compute_accuracy(expected_grades, actual_grades)
  output_file = generate_html_output(output_filename, prompt, accuracy, actual_grades, expected_grades)

  system("open", output_file)
end

main if __FILE__ == $PROGRAM_NAME
