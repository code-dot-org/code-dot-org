# == Schema Information
#
# Table name: pd_survey_questions
#
#  id         :integer          not null, primary key
#  form_id    :integer
#  questions  :text(65535)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_pd_survey_questions_on_form_id  (form_id) UNIQUE
#

class Pd::SurveyQuestion < ApplicationRecord
end
