class LessonTutor < RubyLLM::Agent
  model "gpt-4o-mini"
  temperature 0.5

  def self.generate(lesson, assessment_analysis, reflection)
    context_tool = GetStudentLessonContext.new(assessment_analysis, reflection)
    welcome_tool = ChatWelcome.new
    agent = chat
    agent.with_instructions(ChatWelcome.system_prompt(lesson))
    agent.with_tool(context_tool)
    agent.with_tool(welcome_tool)
    agent.ask("Generate a welcome message for this student.")
    welcome_tool.message
  end
end
