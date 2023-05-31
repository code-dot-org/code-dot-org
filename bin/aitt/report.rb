class Report
  def initialize
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

      accuracy = accuracy.nan? ? 'N/A' : "#{accuracy.to_i}%"
      file.puts "  <h2>Overall Accuracy: #{accuracy}</h2>"
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

  private

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
end
