require 'test_helper'

class SurveyResultsControllerTest < ActionController::TestCase

  setup do
    @teacher = create(:teacher)
  end

  test "post survey results" do
    sign_in @teacher

    assert_creates(SurveyResult) do
      post :create, {survey: {survey2016_ethnicity_asian: 22, survey2016_foodstamps: 3}, format: :json}
    end

    survey_result = SurveyResult.where(user: @teacher).first
    assert survey_result
    assert survey_result["properties"]["survey2016_ethnicity_asian"] == 22
    assert survey_result["properties"]["survey2016_foodstamps"] == 3
  end

end
