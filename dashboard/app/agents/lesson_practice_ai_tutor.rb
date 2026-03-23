class LessonPracticeAITutor < RubyLLM::Agent
  model "gpt-4o-mini"
  temperature 0.7

  # Build a configured agent for the given lesson.
  # Returns an agent instance with the lesson-specific system prompt
  # and a SuggestFlashcards tool pre-loaded with the lesson's vocabulary.
  #
  # Usage:
  #   vocabulary_tool = SuggestFlashcards.new(lesson.vocabularies)
  #   agent = LessonPracticeAITutor.for_lesson(lesson, vocabulary_tool)
  #   response = agent.ask("What does 'algorithm' mean?")
  #   agent.flashcard_tool.called? # => true if it suggested flashcards
  def self.for_lesson(lesson, vocabulary_tool)
    agent = chat

    vocab_list = lesson.vocabularies.map do |v|
      "  - ID #{v.id}: #{v.word} - #{v.definition}"
    end.join("\n")

    system_prompt = build_system_prompt(lesson.localized_name, vocab_list)

    # Set the lesson-specific system prompt on the underlying chat
    agent.chat.with_instructions(system_prompt)
    agent.with_tool(vocabulary_tool)

    agent
  end

  def self.build_system_prompt(lesson_name, vocab_list)
    vocab_section = if vocab_list.present?
      <<~VOCAB
        Vocabulary for this lesson:
        #{vocab_list}

        When the student asks about vocabulary words, definitions, or wants to study terms,
        use the suggest_flashcards tool with the relevant vocabulary IDs from the list above.
      VOCAB
    else
      ""
    end

    <<~PROMPT
      You are a friendly and encouraging AI tutor helping a student review their lesson.

      Lesson: #{lesson_name}

      #{vocab_section}
      Keep your responses concise and supportive. Focus on helping the student understand
      the lesson material. Ask follow-up questions to check understanding when appropriate.
    PROMPT
  end
end
