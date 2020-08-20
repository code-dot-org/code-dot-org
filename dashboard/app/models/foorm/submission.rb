# == Schema Information
#
# Table name: foorm_submissions
#
#  id           :integer          not null, primary key
#  form_name    :string(255)      not null
#  form_version :integer          not null
#  answers      :text(16777215)   not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

class Foorm::Submission < ActiveRecord::Base
  has_one :metadata, class_name: 'Pd::WorkshopSurveyFoormSubmission', foreign_key: :foorm_submission_id
  belongs_to :form, foreign_key: [:form_name, :form_version], primary_key: [:name, :version]

  def parsed_answers
    JSON.parse answers
  end

  # Returns an array of hashes, each having two keys -- :question and :answer.
  # The questions and answers are in human readable formats.
  def formatted_answers
    question_answer_pairs = []

    a = parsed_answers

    # parsed_questions comes from the survey, and as a result will generate
    # blank entries for questions that a respondent did not answer.
    form.parsed_questions[:general][form.key].each do |question_id, question_details|
      choices = question_details[:choices]
      response_to_question = a[question_id]

      # Place to store the formatted question and answer
      # we'll export to a CSV.
      question_answer_pair = {}

      case question_details[:type]
      when 'matrix'
        section_preamble = question_details[:title]
        matrix_questions_text = question_details[:rows]

        response_to_question&.each do |matrix_question_id, answer|
          question_text = matrix_questions_text[matrix_question_id]

          question_answer_pair = {
            question: "#{section_preamble} >> #{question_text}",
            answer: question_details[:columns][answer]
          }

          question_answer_pairs << question_answer_pair
        end
      when 'singleSelect'
        question_answer_pair = {
          question: question_details[:title],
          answer: choices[response_to_question]
        }

        question_answer_pairs << question_answer_pair
      when 'multiSelect'
        question_answer_pair = {
          question: question_details[:title],
          answer: response_to_question&.map {|selected| choices[selected]}&.join(', ')
        }

        question_answer_pairs << question_answer_pair
      when 'scale', 'text'
        question_answer_pair = {
          question: question_details[:title],
          answer: response_to_question
        }

        question_answer_pairs << question_answer_pair
      end
    end

    question_answer_pairs
  end
end
