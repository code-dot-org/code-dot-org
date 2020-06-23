# == Schema Information
#
# Table name: foorm_misc_surveys
#
#  id                  :integer          not null, primary key
#  foorm_submission_id :integer          not null
#  user_id             :integer
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_foorm_misc_surveys_on_user_id              (user_id)
#  index_misc_survey_foorm_submissions_on_foorm_id  (foorm_submission_id) UNIQUE
#

class Foorm::MiscSurvey < ActiveRecord::Base
  belongs_to :foorm_submission, class_name: 'Foorm::Submission'
  belongs_to :user
end
