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

  puts "#{student_id} request data size: #{data.to_json.size}"

  start_time = Time.now
  response = HTTParty.post(api_url, headers: headers, body: data.to_json, timeout: 120)

  if response.code == 200
    puts "#{student_id} response succeeded in #{Time.now - start_time} seconds"
    completed_text = response.parsed_response['choices'][0]['message']['content']
    CSV.parse(completed_text.strip, headers: true).map(&:to_h)
  else
    puts "#{student_id} Error calling the API: #{response.code}"
    puts "#{student_id} response failed in #{Time.now - start_time} seconds"
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
              doc.th 'Key Concept'
              doc.th 'Expected Grade'
              doc.th 'Actual Grade'
              doc.th 'Reason'
            }
            criteria.each do |row|
              expected_grade = expected_grades[student_id][row['Key Concept']]
              cell_color = expected_grade == row['Grade'] ? 'green' : 'red'
              doc.tr {
                doc.td row['Key Concept']
                doc.td expected_grade
                doc.td(style: "background-color: #{cell_color};") {
                  doc.text row['Grade']
                }
                doc.td row['Reason']
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

  system("open", output_file)
end

main if __FILE__ == $PROGRAM_NAME
