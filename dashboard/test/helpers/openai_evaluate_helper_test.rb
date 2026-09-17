require 'test_helper'

class OpenaiEvaluateHelperTest < ActionView::TestCase
  include OpenaiEvaluateHelper

  setup do
    @student1 = create(:student)
    @unit = create(:script, :with_levels, levels_count: 1)
    @free_response_level = @unit.script_levels.first.level
  end

  test "evaluate_free_response calls evaluate" do
    fr_level_source = create(:level_source, data: "This is my free response answer")
    fr_user_level = create(:user_level, user: @student1, level: @free_response_level, script: @unit, level_source: fr_level_source)

    OpenaiEvaluateHelper.expects(:evaluate).with(
      @free_response_level,
      student_work: "This is my free response answer",
      evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]
    ).returns({status: 200, json: {"content" => {
      aiEvaluation: "Meets",
      evaluationCriteria: "Did student answer the question?",
      aiReasoning: "Student provided a complete answer",
    }.to_json}}
)

    OpenaiEvaluateHelper.evaluate_free_response(fr_user_level, @unit)
  end
end
