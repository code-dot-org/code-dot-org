# == Schema Information
#
# Table name: pd_survey_questions
#
#  id            :integer          not null, primary key
#  form_id       :integer
#  question_id   :string(255)
#  question_text :string(255)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_pd_survey_questions_on_form_id      (form_id)
#  index_pd_survey_questions_on_question_id  (question_id)
#

class Pd::SurveyQuestion < ApplicationRecord
end
