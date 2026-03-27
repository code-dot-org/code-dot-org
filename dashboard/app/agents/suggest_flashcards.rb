class SuggestFlashcards < RubyLLM::Tool
  description "Show vocabulary flashcards to help the student study terms from the lesson. " \
              "Use this when the student asks about vocabulary words, definitions, or wants to study terms."

  params do
    array :vocabulary_ids, of: :string,
      description: "IDs of the vocabulary words to show as flashcards. " \
                   "Choose from the vocabulary list provided in your context."
  end

  def initialize(vocabulary)
    puts "Initializing SuggestFlashcards tool with #{vocabulary.size} vocabulary words"
    @vocabulary = vocabulary.map do |v|
      {id: v.id.to_s, word: v.word, definition: v.definition}
    end
    @suggested_ids = []
  end

  def execute(vocabulary_ids:)
    @suggested_ids = Array(vocabulary_ids).map(&:to_s)
    valid_words = @vocabulary.select {|v| @suggested_ids.include?(v[:id])}.map {|v| v[:word]}
    {
      message: "Showing flashcards for: #{valid_words.join(', ')}.",
      flashcards_shown: valid_words.count
    }
  end

  attr_reader :suggested_ids

  def called?
    @suggested_ids.any?
  end
end
