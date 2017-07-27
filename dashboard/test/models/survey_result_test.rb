require 'test_helper'

class SurveyResultTest < ActiveSupport::TestCase
  test 'proper SurveyResult members' do
    assert SurveyResult::ETHNICITIES['asian'] == 'Asian'
    assert SurveyResult::ALL_ATTRS.include? 'diversity_asian'
    assert SurveyResult::ALL_ATTRS.include? 'diversity_farm'
    assert SurveyResult::ALL_ATTRS.include? 'nps_value'
    assert SurveyResult::ALL_ATTRS.include? 'nps_comment'
  end

  test 'all attributes are labeled as free-response or non-free-response' do
    SurveyResult::ALL_ATTRS.each do |attr|
      assert SurveyResult::FREE_RESPONSE_ATTRS.include?(attr) ||
        SurveyResult::NON_FREE_RESPONSE_ATTRS.include?(attr)
    end
  end

  test 'clear_open_ended_responses clears open-ended responses' do
    survey_result = SurveyResult.new(
      kind: SurveyResult::NET_PROMOTER_SCORE_2015,
      nps_comment: 'blah blah',
      nps_value: 10
    )
    survey_result.clear_open_ended_responses
    assert_equal SurveyResult::SYSTEM_DELETED, survey_result.reload.nps_comment
  end

  test 'clear_open_ended_responses does not mutate multi-choice responses' do
    survey_result = SurveyResult.new(
      kind: SurveyResult::NET_PROMOTER_SCORE_2015,
      nps_comment: 'blah blah',
      nps_value: 10
    )
    survey_result.clear_open_ended_responses
    assert_equal 10, survey_result.reload.nps_value

    survey_result = SurveyResult.new(
      kind: SurveyResult::DIVERSITY_2016,
      diversity_other: 18,
      diversity_farm: 2
    )
    survey_result.clear_open_ended_responses
    assert_equal 18, survey_result.diversity_other
    assert_equal 2, survey_result.diversity_farm
  end
end
