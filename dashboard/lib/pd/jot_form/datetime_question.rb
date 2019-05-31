module Pd
  module JotForm
    class DatetimeQuestion < Question
      def self.supported_types
        [
          TYPE_DATETIME
        ]
      end

      def answer_type
        ANSWER_DATETIME
      end

      def get_value(answer)
        answer
      end
    end
  end
end
