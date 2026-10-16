require 'test_helper'

class SurveyResultTest < ActiveSupport::TestCase
  test 'proper SurveyResult members' do
    assert SurveyResult::ETHNICITIES['asian'] == 'Asian'
    assert_includes(SurveyResult::ALL_ATTRS, 'diversity_asian')
    assert_includes(SurveyResult::ALL_ATTRS, 'diversity_farm')
    assert_includes(SurveyResult::ALL_ATTRS, 'nps_value')
    assert_includes(SurveyResult::ALL_ATTRS, 'nps_comment')
  end

  test 'all attributes are labeled as free-response or non-free-response' do
    SurveyResult::ALL_ATTRS.each do |attr|
      assert SurveyResult::FREE_RESPONSE_ATTRS.include?(attr) ||
        SurveyResult::NON_FREE_RESPONSE_ATTRS.include?(attr)
    end
  end

  test 'Diversity2026 is a valid kind' do
    assert_equal 'Diversity2026', SurveyResult::DIVERSITY_2026
    assert SurveyResult.new(kind: SurveyResult::DIVERSITY_2026).valid?
  end
end
