require 'test_helper'

class SurveyResultsControllerTest < ActionController::TestCase

  setup do
    @teacher = create(:teacher)
  end

  test 'post diversity survey results' do
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

  test 'post net promoter score survey results' do
    sign_in @teacher

    nps_value = 10
    nps_comment = "Rock on"
    assert_creates(SurveyResult) do
      post :create, {survey: {kind: 'NetPromoterScore2015', nps_value: nps_value, nps_comment: nps_comment}, format: :json}
    end

    survey_result = SurveyResult.where(user: @teacher).first
    assert survey_result
    assert_equal 'NetPromoterScore2015', survey_result.kind
    assert_equal nps_value, survey_result.properties['nps_value']
    assert_equal nps_comment, survey_result.properties['nps_comment']
  end

  test 'blocks non-whitelisted parameters' do
    sign_in @teacher

    assert_creates(SurveyResult) do
      post :create, {survey: {kind: 'Diversity2016', nonwhitelisted: 'untrusted data'}, format: :json}
    end

    survey_result = SurveyResult.where(user: @teacher).first
    assert survey_result
    assert_equal 'Diversity2016', survey_result.kind
    assert survey_result['properties']['nonwhitelisted'].nil?
  end

end
