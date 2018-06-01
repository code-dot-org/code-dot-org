module Pd
  module JotForm
    class TextQuestion < Question
      def self.supported_types
        [
          TYPE_TEXTBOX,
          TYPE_TEXTAREA,

          # Number is a textbox with extra validation
          TYPE_NUMBER
        ]
      end

      def answer_type
        ANSWER_TEXT
      end

      def get_value(answer)
        answer
      end
    end
  end
end
