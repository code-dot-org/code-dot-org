require 'test_helper'

class WorkshopSurveyReportCsvConverterTest < ActionController::TestCase
  include Pd::WorkshopSurveyReportCsvConverter

  setup do
    @survey_report = {
      'First Workshop': {overall_success: 1, anything_else_s: %w(hello there)},
      'Second Workshop': {overall_success: 2, anything_else_s: %w(how are you)},
      'Third Workshop': {overall_success: 3, anything_else_s: %w(good bye)}
    }
  end

  test 'WorkshopSurveyReportConverter converts to csv as expected' do
    expected = [
      {Workshops: 'First Workshop', 'Overall Success Score (out of 6)' => 1, 'Is there anything else you’d like to tell us about your experience at this workshop?' => 'hello / there'},
      {Workshops: 'Second Workshop', 'Overall Success Score (out of 6)' => 2, 'Is there anything else you’d like to tell us about your experience at this workshop?' => 'how / are / you'},
      {Workshops: 'Third Workshop', 'Overall Success Score (out of 6)' => 3, 'Is there anything else you’d like to tell us about your experience at this workshop?' => 'good / bye'}
    ]

    assert_equal expected, convert_to_csv(@survey_report)
  end
end
