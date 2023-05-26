require 'launchy'

class Report
  def initialize
  end

  def generate_html_output(output_path, system_prompt, expected_passes, expected_failures)
    styles = '<style>
      .green {
        background-color: lightgreen;
      }

      .red {
        background-color: lightcoral;
      }
    </style>'

    File.open(output_path, 'w') do |file|
      file.puts '<!DOCTYPE html>'
      file.puts '<html lang="en">'
      file.puts styles
      file.puts '<head>'
      file.puts '  <meta charset="UTF-8">'
      file.puts '  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
      file.puts '  <title>Rubric Test Results</title>'
      file.puts '</head>'
      file.puts '<body style="-webkit-print-color-adjust: exact;">'
      file.puts "  <h2>Prompt:</h2>"
      file.puts "  <pre>#{system_prompt}</pre>"
      populate_summary_table(file, expected_passes, expected_failures)

      file.puts "  <h2>Results:</h2>"
      # Display results for prompts expected to succeed
      file.puts "  <p>Expected passes: #{expected_passes.length}</p>"
      populate_results_table(file, expected_passes, 0)

      # Display results for prompts expected to fail
      file.puts "  <p>Expected failures: #{expected_failures.length}</p>"
      populate_results_table(file, expected_failures, 1)

      file.puts '</body>'
      file.puts '</html>'
    end

    puts "Opening HTML report at #{output_path}"
    Launchy.open(output_path)
  end

  private

  def compute_pass_fail_color(expected, actual)
    expected == actual ? 'green' : 'red'
  end

  def populate_summary_table(file, expected_passes, expected_failures)
    true_positives = expected_passes.count { |_, result| result["flagged"] == 0 }
    true_negatives = expected_failures.count { |_, result| result["flagged"] != 0 }
    false_positives = expected_failures.count { |_, result| result["flagged"] == 0 }
    false_negatives = expected_passes.count { |_, result| result["flagged"] != 0 }

    file.puts "  <h2>Confusion Matrix:</h2>"
    file.puts "  <table>"
    file.puts "    <tr>"
    file.puts "      <th></th>"
    file.puts "      <th>Expected Positive</th>"
    file.puts "      <th>Expected Negative</th>"
    file.puts "    </tr>"
    file.puts "    <tr>"
    file.puts "      <th>Actual Positive</th>"
    file.puts "      <td class='green'>#{true_positives} - prompts we wanted to generate results that did</td>"
    file.puts "      <td class='red'>#{false_negatives} - prompts we wanted to generate results that didn't</td>"
    file.puts "    </tr>"
    file.puts "    <tr>"
    file.puts "      <th>Actual Negative</th>"
    file.puts "      <td class='red'>#{false_positives} - prompts that should have been blocked that were not</td>"
    file.puts "      <td class='green'>#{true_negatives} - prompts that should have been blocked that were</td>"
    file.puts "    </tr>"
    file.puts "  </table>"
  end

  def populate_results_table(file, results, expected_flag)
    file.puts "<table>\n"
    file.puts "<tr><th>Prompt</th><th>Expected content flag</th><th>Actual content flag</th><th>Reason</th></tr>\n"

    results.each do |prompt, result|
      actual_flag = result["flagged"]
      row_color = compute_pass_fail_color(actual_flag, expected_flag)
      file.puts "  <tr class='#{row_color}'>"
      file.puts "    <td>#{prompt}</td>"
      file.puts "    <td>#{expected_flag}</td>"
      file.puts "    <td>#{result['flagged']}</td>"
      file.puts "    <td>#{result['reason']}</td>"
      file.puts "  </tr>"
    end

    file.puts "</table>\n"
  end
end