require 'test_helper'

class HintViewRequestTest < ActiveSupport::TestCase
  setup do
    @student = create :student
    @unit = create :script
    @level_one = create :level
    @level_two = create :level
  end

  test "can retrieve feedback for milestone request" do
    HintViewRequest.stubs(:enabled?).returns(true)

    HintViewRequest.create(
      script: @script,
      level: @level_one,
      user: @student,
      feedback_type: 1,
      feedback_xml: '<block type="first"></block>'
    )
    HintViewRequest.create(
      script: @script,
      level: @level_one,
      user: @student,
      feedback_type: 1,
      feedback_xml: '<block type="second"></block>'
    )
    HintViewRequest.create(
      script: @script,
      level: @level_two,
      user: @student,
      feedback_type: 1,
      feedback_xml: '<block type="third"></block>'
    )

    first_level_response = HintViewRequest.milestone_response(@script, @level_one, @student)
    second_level_response = HintViewRequest.milestone_response(@script, @level_two, @student)

    assert_equal first_level_response, [{feedback_type: 1, feedback_xml: '<block type="first"></block>'}, {feedback_type: 1, feedback_xml: '<block type="second"></block>'}]
    assert_equal second_level_response, [{feedback_type: 1, feedback_xml: '<block type="third"></block>'}]
  end

  test "can be disabled" do
    HintViewRequest.stubs(:enabled?).returns(false)

    HintViewRequest.create(
      script: @script,
      level: @level_one,
      user: @student,
      feedback_type: 1,
      feedback_xml: '<block type="first"></block>'
    )

    empty_response = HintViewRequest.milestone_response(@script, @level_one, @student)
    assert_equal empty_response, []
  end
end
