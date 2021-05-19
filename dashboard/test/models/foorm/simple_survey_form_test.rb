require 'test_helper'

class Foorm::SimpleSurveyFormTest < ActiveSupport::TestCase
  test 'simple survey forms with valid paths are valid' do
    VALID_PATHS = [
      'nps2020',
      'nps_2020',
      'nps',
      '2020'
    ]

    VALID_PATHS.each do |path|
      simple_survey_form = build :foorm_simple_survey_form, path: path
      assert simple_survey_form.valid?
    end
  end

  test 'simple survey forms with invalid paths are invalid' do
    INVALID_PATHS = [
      'nps 2020',
      'nps-2020',
      'NPS'
    ]

    INVALID_PATHS.each do |path|
      simple_survey_form = build :foorm_simple_survey_form, path: path
      refute simple_survey_form.valid?
    end
  end
end
