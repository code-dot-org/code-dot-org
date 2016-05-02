require 'test_helper'

class SurveyResultsControllerTest < ActionController::TestCase

  setup do
    @teacher = create(:teacher)
  end

  test "post survey results" do
    sign_in @teacher

    assert_creates(SurveyResult) do
      post :create, {survey: {kind: 'Diversity2016', survey2016_ethnicity_asian: 22, survey2016_foodstamps: 3}, format: :json}
    end

    survey_result = SurveyResult.where(user: @teacher).first
    assert survey_result
    assert_equal 'Diversity2016', survey_result.kind
    assert_equal 22, survey_result["properties"]["survey2016_ethnicity_asian"]
    assert_equal 3, survey_result["properties"]["survey2016_foodstamps"]
  end

end
