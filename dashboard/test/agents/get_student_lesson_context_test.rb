require 'test_helper'

class GetStudentLessonContextTest < ActiveSupport::TestCase
  test "execute returns assessment_results and reflection keys" do
    analysis = [{level_id: 1, correct: false}]
    reflection = {success: "Got it", struggle: "Loops", objective_reflections: []}
    tool = GetStudentLessonContext.new(analysis, reflection)
    result = tool.execute
    assert_equal analysis, result[:assessment_results]
    assert_equal reflection, result[:reflection]
  end

  test "execute preserves the exact objects passed to initialize" do
    analysis = []
    reflection = {success: nil, struggle: nil, objective_reflections: []}
    tool = GetStudentLessonContext.new(analysis, reflection)
    result = tool.execute
    assert_same analysis, result[:assessment_results]
    assert_same reflection, result[:reflection]
  end
end
