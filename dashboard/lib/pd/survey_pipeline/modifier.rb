module Pd::SurveyPipeline
  module Modifier
    def convert_answer_strings_to_numbers(question_answer_joined)
      question_answer_joined.each do |qa|
        if qa.dig(:option_map, qa[:answer])
          qa[:answer_to_number] = qa[:option_map][qa[:answer]]
        end
      end
    end
  end
end
