require 'test_helper'

class SurveyResultTest < ActiveSupport::TestCase
  test "proper SurveyResult members" do
    assert SurveyResult::ETHNICITIES["asian"] == "Asian"
    assert SurveyResult::RESULT_ATTRS.include? "survey2016_ethnicity_asian"
    assert SurveyResult::RESULT_ATTRS.include? "survey2016_foodstamps"
  end

end
