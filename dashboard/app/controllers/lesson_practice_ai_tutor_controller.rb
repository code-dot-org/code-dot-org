class LessonPracticeAiTutorController < ApplicationController
  before_action :authenticate_user!

  # POST /lesson_practice_ai_tutor/chat
  #
  # Params:
  #   lesson_id: integer - the lesson's ID
  #   message:   string - the student's new message
  #   history:   array of {role: "user"|"assistant", content: string}
  #
  # Returns:
  #   response:                 string - the tutor's reply
  #   show_flashcards:          bool - true if the tutor suggested vocabulary flashcards
  #   flashcard_vocabulary_ids: array of string IDs
  def chat
    lesson = find_lesson
    return render status: :not_found, json: {error: "Lesson not found"} unless lesson
    puts "Received chat message for lesson '#{lesson.localized_name}': #{params[:message]}"
    vocabulary_tool = SuggestFlashcards.new(lesson.vocabularies)
    agent = LessonPracticeAITutor.for_lesson(lesson, vocabulary_tool)

    # Replay conversation history so the agent has context
    # Array(params[:history]).each do |msg|
    #   role = msg[:role].to_sym
    #   next unless [:user, :assistant].include?(role)
    #   agent.add_message(role: role, content: msg[:content].to_s)
    # end

    response = agent.ask(params[:message].to_s)

    puts "AI Tutor response: #{response.content}"

    render json: {
      response: response.content,
      show_flashcards: vocabulary_tool.called?,
      flashcard_vocabulary_ids: vocabulary_tool.suggested_ids
    }
  rescue => e
    Rails.logger.error "LessonPracticeAiTutorController#chat error: #{e.message}"
    render status: :internal_server_error, json: {error: "Unable to process your request."}
  end

  private

  def find_lesson
    Lesson.find_by(id: params[:lesson_id])
  end
end
