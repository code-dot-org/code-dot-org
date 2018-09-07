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
end
