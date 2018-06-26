module Pd
  module JotForm
    class QuestionWithOptions < Question
      attr_accessor :options

      def to_h
        super.merge(
          options: options
        )
      end

      def answer_type
        ANSWER_SELECT_VALUE
      end

      # @override
      def type_specific_summary
        {options: options}
      end
    end
  end
end
