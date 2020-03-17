
module Pd::Foorm
  class RollupCreator
    include Constants
    extend Helper

    def self.calculate_average_rollup(parsed_forms, form_submissions, questions_to_summarize)
      intermediate_rollup = {}
      form_submissions.each do |submission|
        answers = JSON.parse(submission.answers)
        questions_to_summarize.each do |question|
          next unless answers[question]
          intermediate_rollup[question] ||= {}
          answers[question].each do |matrix_question, matrix_answer|
            intermediate_rollup[question][matrix_question] ||= {sum: 0, count: 0}
            intermediate_rollup[question][matrix_question][:sum] += matrix_answer.to_i
            intermediate_rollup[question][matrix_question][:count] += 1
          end
        end
      end
      rollup = {}
      intermediate_rollup.each do |question, answers|
        rollup[question] = {}
        answers.each do |matrix_question, matrix_answer|
          rollup[question][matrix_question] = matrix_answer[:sum].to_f / matrix_answer[:count]
        end
      end
      return rollup
    end
  end
end
