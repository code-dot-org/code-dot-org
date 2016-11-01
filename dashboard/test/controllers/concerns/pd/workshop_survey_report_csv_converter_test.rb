require 'test_helper'

class WorkshopSurveyReportCsvConverterTest < ActionController::TestCase
  include Pd::WorkshopSurveyReportCsvConverter

  setup do
    @survey_report = {
      'First Workshop': {question_1: 1, multiline: ['hello', 'there']},
      'Second Workshop': {question_1: 2, multiline: ['how', 'are', 'you']},
      'Third Workshop': {question_1: 3, multiline: ['whassup']}
    }
  end

  test 'WorkshopSurveyReportConverter converts to csv as expected' do
    expected = [
      {'Workshops': 'First Workshop', 'question_1': 1, 'multiline': 'hello / there'}.stringify_keys,
      {'Workshops': 'Second Workshop', 'question_1': 2, 'multiline': 'how / are / you'}.stringify_keys,
      {'Workshops': 'Third Workshop', 'question_1': 3, 'multiline': 'whassup'}.stringify_keys
    ]

    assert_equal expected, convert_to_csv(@survey_report)
  end
end
