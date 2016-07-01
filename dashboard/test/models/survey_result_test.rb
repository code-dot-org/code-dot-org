require 'test_helper'

class SurveyResultTest < ActiveSupport::TestCase
  test 'proper SurveyResult members' do
    assert SurveyResult::ETHNICITIES['asian'] == 'Asian'
    assert SurveyResult::ALL_ATTRS.include? 'survey2016_ethnicity_asian'
    assert SurveyResult::ALL_ATTRS.include? 'survey2016_foodstamps'
    assert SurveyResult::ALL_ATTRS.include? 'nps_value'
    assert SurveyResult::ALL_ATTRS.include? 'nps_comment'
  end
end
