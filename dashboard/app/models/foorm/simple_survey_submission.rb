# == Schema Information
#
# Table name: foorm_simple_survey_submissions
#
#  id                    :integer          not null, primary key
#  foorm_submission_id   :integer          not null
#  user_id               :integer
#  simple_survey_form_id :bigint
#  misc_form_path        :string(255)
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#
# Indexes
#
#  index_foorm_simple_survey_submissions_on_foorm_submission_id  (foorm_submission_id) UNIQUE
#  index_foorm_simple_survey_submissions_on_user_id              (user_id)
#

class Foorm::SimpleSurveySubmission < ApplicationRecord
  belongs_to :foorm_submission, class_name: 'Foorm::Submission'
  belongs_to :user
  belongs_to :simple_survey_form

  validates :simple_survey_form, presence: true

  def save_with_foorm_submission(answers, form_name, form_version)
    ActiveRecord::Base.transaction do
      create_foorm_submission!(form_name: form_name, form_version: form_version, answers: answers)
      save!
    end
  end
end
