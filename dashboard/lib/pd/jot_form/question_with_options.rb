module Pd
  module JotForm
    class QuestionWithOptions < Question
      attr_accessor :options

      def to_h
        super.merge(
          options: options
        )
      end

      # @override
      def answer_type
        ANSWER_SINGLE_SELECT
      end

      def multi_select?
        answer_type == ANSWER_MULTI_SELECT
      end

      def single_select?
        answer_type == ANSWER_SINGLE_SELECT
      end

      # @override
      def type_specific_summary
        {options: options}
      end
    end
  end
end
