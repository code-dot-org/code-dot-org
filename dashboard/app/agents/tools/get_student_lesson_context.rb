class GetStudentLessonContext < RubyLLM::Tool
  description "Retrieve the student's assessment results and lesson reflection. Call this first."

  def initialize(assessment_analysis, reflection)
    @assessment_analysis = assessment_analysis
    @reflection = reflection
  end

  def execute
    {
      assessment_results: @assessment_analysis,
      reflection: @reflection
    }
  end
end
