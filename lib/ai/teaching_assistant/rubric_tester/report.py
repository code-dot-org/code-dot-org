import os
import csv
import io
import json
from typing import List, Dict, Any
from config import VALID_GRADES

class Report:
    def __init__(self):
        pass

    def _compute_pass_fail_cell_color(self, expected, actual, passing_grades):
        if Report.accurate(expected, actual, passing_grades):
            return 'green'
        else:
            return 'red'

    def _compute_actual_cell_color(self, actual, expected, passing_grades):
        if passing_grades:
            return self._compute_pass_fail_cell_color(expected, actual, passing_grades)

        expected_index = VALID_GRADES.index(expected) if expected in VALID_GRADES else None
        actual_index = VALID_GRADES.index(actual) if actual in VALID_GRADES else None
        grade_difference = abs(expected_index - actual_index) if expected_index is not None and actual_index is not None else None
        if grade_difference == 0:
            return 'green'
        elif grade_difference == 1:
            return 'yellow'
        else:
            return 'red'

    def _rubric_to_html_table(self, rubric):
        parsed_rubric = list(csv.reader(io.StringIO(rubric)))

        header_row = parsed_rubric.pop(0)
        header_html = ''.join([f'<th>{header}</th>' for header in header_row])

        rows_html = ''
        for row in parsed_rubric:
            rows_html += '<tr>'
            for cell in row:
                rows_html += f'<td>{cell}</td>'
            rows_html += '</tr>'

        return f'''
        <table border="1">
          <thead>
            <tr>{header_html}</tr>
          </thead>
          <tbody>
            {rows_html}
          </tbody>
        </table>
        '''

    def _calculate_accuracy_color(self, percentage):
        intensity = int((percentage - 50) * 5.1)
        if percentage >= 50:
            return f'rgb({255 - intensity}, 255, {255 - intensity})'
        else:
            return f'rgb(255, {intensity + 200}, {intensity + 200})'

    def _generate_accuracy_table(self, accuracy_by_criteria):
        accuracy_table = '<table border="1">'
        accuracy_table += '<tr><th>Key Concept</th><th>Accuracy</th></tr>'
        for criteria, accuracy in accuracy_by_criteria.items():
            color = self._calculate_accuracy_color(accuracy)
            accuracy_table += f'<tr><td>{criteria}</td><td style="background-color: {color};">{int(accuracy)}%</td></tr>'
        accuracy_table += '</table>'
        return accuracy_table

    def generate_html_output(self, output_file, prompt, rubric, accuracy, actual_grades, expected_grades, passing_grades, accuracy_by_criteria, errors, command_line):
        link_base_url = f'file://{os.getcwd()}/sample_code'

        with open(output_file, 'w') as file:
            file.write('<!DOCTYPE html>\n')
            file.write('<html lang="en">\n')
            file.write('<head>\n')
            file.write('  <meta charset="UTF-8">\n')
            file.write('  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n')
            file.write('  <title>Rubric Test Results</title>\n')
            file.write('</head>\n')
            file.write('<body style="-webkit-print-color-adjust: exact;">\n')
            file.write('  <h2>Prompt:</h2>\n')
            file.write(f'  <pre>{prompt}</pre>\n')
            file.write('  <h2>Rubric:</h2>\n')
            file.write(self._rubric_to_html_table(rubric) + '\n')
            if len(errors) > 0:
                file.write(f'  <h2 style="color: red">Errors: {len(errors)}</h2>\n')
                file.write(f'  <p style="color: red">{", ".join(errors)} failed to load</p>\n')

            file.write('  <h2>Command Line:</h2>\n')
            file.write(f'  <pre>{command_line}</pre>\n')

            accuracy = 'N/A' if accuracy is None else f'{int(accuracy)}%'
            file.write(f'  <h2>Overall Accuracy: {accuracy}</h2>\n')
            file.write('  <h2>Accuracy by Key Concept:</h2>\n')
            file.write(self._generate_accuracy_table(accuracy_by_criteria) + '\n')

            file.write('  <h2>Grades by student:</h2>\n')
            for student_id, grades in actual_grades.items():
                file.write(f'  <h3>Student: {student_id}</h3>\n')
                file.write(f'  <a href="{link_base_url}/{student_id}.js">{student_id}.js</a>\n')
                file.write('  <table border="1">\n')
                file.write('    <tr><th>Criteria</th><th>Observations</th><th>Expected Grade</th><th>Actual Grade</th><th>Reason</th></tr>\n')
                for grade in grades:
                    criteria = grade['Key Concept']
                    observations = grade['Observations']
                    expected = expected_grades[student_id][criteria]
                    actual = grade['Grade']
                    reason = grade['Reason']
                    cell_color = self._compute_actual_cell_color(actual, expected, passing_grades)
                    file.write(f'    <tr><td>{criteria}</td><td>{observations}</td><td>{expected}</td><td style="background-color: {cell_color};">{actual}</td><td>{reason}</td></tr>\n')
                file.write('  </table>\n')

            file.write('</body>\n')
            file.write('</html>\n')

    @staticmethod
    def accurate(expected_grade, actual_grade, passing_grades):
        if passing_grades:
            return passing_grades.count(expected_grade) == passing_grades.count(actual_grade)
        else:
            return expected_grade == actual_grade
