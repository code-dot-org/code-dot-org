class LessonDeepDiveWelcomeAgent < RubyLLM::Agent
  model "gpt-4o-mini"
  temperature 0.5

  # Generate a personalized welcome message for a student opening the tutor chat.
  # Uses the GetStudentLessonContext tool so the LLM can examine assessment results
  # and reflection before composing the message.
  def self.generate(lesson, assessment_analysis, reflection)
    context_tool = GetStudentLessonContext.new(assessment_analysis, reflection)
    agent = chat
    agent.with_instructions(build_system_prompt(lesson))
    agent.with_tool(context_tool)
    agent.ask("Generate a welcome message for this student.").content
  end

  def self.build_system_prompt(lesson)
    <<~PROMPT
      You are a friendly AI tutor. A student just finished the lesson "#{lesson.localized_name}".

      Use the get_student_lesson_context tool to retrieve their assessment results and reflection,
      then write a welcome message that:
      - Is 2-3 sentences max
      - Is warm and encouraging
      - Names one or two specific things they struggled with (if any incorrect assessments or
        low-confidence objectives exist)
      - Ends with a concrete suggestion of what you can work on together

      If the student did well across the board, acknowledge that and suggest deepening understanding
      of the lesson concepts. Do not list every question or repeat the lesson title verbatim.
    PROMPT
  end
end
