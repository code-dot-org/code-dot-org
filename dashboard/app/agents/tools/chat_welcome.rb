class ChatWelcome < RubyLLM::Tool
  description "Submit the composed welcome message. Call this after reviewing student context."
  param :message, desc: "The 2-3 sentence personalized welcome message to deliver."

  def self.system_prompt(lesson)
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

      Once you have composed the message, call the chat_welcome tool with it.
    PROMPT
  end

  attr_reader :message

  def execute(message:)
    @message = message
  end
end
