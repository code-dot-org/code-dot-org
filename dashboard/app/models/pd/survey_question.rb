# == Schema Information
#
# Table name: pd_survey_questions
#
#  id            :integer          not null, primary key
#  form_id       :integer          not null
#  question_id   :string(255)      not null
#  question_text :text(65535)      not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  question_type :string(255)      not null
#  question_name :string(255)      not null
#  parent_id     :integer
#
# Indexes
#
#  index_pd_survey_questions_on_form_id      (form_id)
#  index_pd_survey_questions_on_question_id  (question_id)
#

class Pd::SurveyQuestion < ApplicationRecord
end
