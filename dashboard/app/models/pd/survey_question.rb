# == Schema Information
#
# Table name: pd_survey_questions
#
#  id                 :integer          not null, primary key
#  form_id            :bigint
#  questions          :text(65535)      not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  last_submission_id :bigint
#
# Indexes
#
#  index_pd_survey_questions_on_form_id  (form_id) UNIQUE
#

module Pd
  class SurveyQuestion < ApplicationRecord
    # Sync question data for the specified form_id, upsert the DB row, and return the latest model instance
    # @param form_id [Integer]
    # @return [SurveyQuestion]
    def self.sync_from_jotform(form_id)
      questions = JotForm::Translation.new(form_id).get_questions
      serialized_questions = JotForm::FormQuestions.new(form_id, questions).serialize.to_json

      find_or_initialize_by(form_id: form_id).tap do |model|
        model.update!(
          questions: serialized_questions
        )
      end
    end

    def sync_from_jotform
      self.class.sync_from_jotform form_id
      reload
    end

    def form_questions
      @form_questions ||= JotForm::FormQuestions.deserialize(form_id, JSON.parse(questions))
    end

    def reload
      super
      @form_questions = nil
    end

    def questions=(value)
      super(value)
      @form_questions = nil
    end

    delegate :summarize, to: :form_questions
    delegate :process_answers, to: :form_questions
    delegate :[], to: :form_questions
  end
end
