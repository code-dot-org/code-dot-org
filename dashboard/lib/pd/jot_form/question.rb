# Base class for JotForm questions
# This cannot be constructed directly.
# @see Translation::get_question_class_for(type)
module Pd
  module JotForm
    class Question
      include Constants

      attr_accessor(
        :id,   # question id
        :type, # See Translation::QUESTION_TYPES_TO_CLASS for a complete list of supported types
        :name, # "unique" (not actually enforced by JotForm) name per form
        :text, # label
        :order, # 1-based order the question appears in the form
      )

      def type=(value)
        raise "Invalid type #{value} for #{self.class}" unless self.class.supported_types.include? value
        @type = value
      end

      # Construct from a hash of attributes
      def initialize(params)
        params.each do |k, v|
          send "#{k}=", v
        end
      end

      # Parse jotform question data
      # @param jotform_question [Hash] JSON.parsed jotform question data
      # @return [Question]
      def self.from_jotform_question(jotform_question)
        new(
          id: jotform_question['qid'].to_i,
          type: jotform_question['type'],
          name: jotform_question['name'],
          text: jotform_question['text'],
          order: jotform_question['order'].to_i
        )
      end

      # Serialize to hash
      def to_h
        {
          id: id,
          type: type,
          name: name,
          text: text,
          order: order
        }
      end

      # Override in derived classes to designate types they represent.
      # All question types are defined in Constants::QUESTION_TYPES
      def self.supported_types
        []
      end

      # @return [String] one of ANSWER_TYPES
      def answer_type
        raise 'Must override in derived class'
      end

      # Processes an answer based on the question details,
      # converting to a numeric value where possible.
      # @return type depends on the details: [Integer], or the raw answer.
      def get_value(answer)
        raise 'Must override in derived class'
      end

      # Generate question summary
      # @return [Hash] {question_name => {text:, answer_type:}}
      def summarize
        {name => {text: text, answer_type: answer_type}}
      end

      # Generate form_data for an answer to this question.
      # When merged with the other questions in a form, it will form the entire form_data.
      # @see FormQuestions
      # @param answer [Hash] {question_id => answer}
      # @return [Hash] {question_name => answer}
      def process_answer(answer)
        {name => get_value(answer)}
      end
    end
  end
end
