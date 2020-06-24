# == Schema Information
#
# Table name: foorm_misc_surveys
#
#  id                  :integer          not null, primary key
#  foorm_submission_id :integer          not null
#  user_id             :integer
#  misc_form_path      :string(255)
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

  def self.all_form_data
    [
      {
        form_name: 'surveys/pd/workshop_daily_survey_day_5',
        misc_form_path: 'csd_sample',
        variables: {course_name: 'csd'},
        allow_multiple_submissions: false
      }
    ]
  end

  def self.all_form_paths
    all_form_data.pluck(:misc_form_path)
  end

  def self.find_form_data(misc_form_path)
    all_form_data.detect {|form_data| form_data[:misc_form_path] == misc_form_path}
  end
end
