require 'test_helper'

class SurveyResultsControllerTest < ActionController::TestCase

  setup do
    @teacher = create(:teacher)
  end

  test 'post diveristy survey results' do
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

    NPS_VALUE = 10
    NPS_COMMENT = "Rock on"
    assert_creates(SurveyResult) do
      post :create, {survey: {kind: 'NetPromoterScore2015', nps_value: NPS_VALUE, nps_comment: NPS_COMMENT}, format: :json}
    end

    survey_result = SurveyResult.where(user: @teacher).first
    assert survey_result
    assert_equal 'NetPromoterScore2015', survey_result.kind
    assert_equal NPS_VALUE, survey_result.properties['nps_value']
    assert_equal NPS_COMMENT, survey_result.properties['nps_comment']
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
