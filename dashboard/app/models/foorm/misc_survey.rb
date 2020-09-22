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
        form_name: 'surveys/teachers/teacher_end_of_year_survey',
        misc_form_path: 'csf_post_course',
        survey_data: {course: 'CS Fundamentals', pd: false},
        allow_multiple_submissions: false
      },
      {
        form_name: 'surveys/teachers/teacher_end_of_year_survey',
        misc_form_path: 'csf_post_course_pd',
        survey_data: {course: 'CS Fundamentals', pd: true},
        allow_multiple_submissions: false
      },
      {
        form_name: 'surveys/teachers/teacher_end_of_year_survey',
        misc_form_path: 'csd_post_course',
        survey_data: {course: 'CS Discoveries', pd: false},
        allow_multiple_submissions: false
      },
      {
        form_name: 'surveys/teachers/teacher_end_of_year_survey',
        misc_form_path: 'csd_post_course_pd',
        survey_data: {course: 'CS Discoveries', pd: true},
        allow_multiple_submissions: false
      },
      {
        form_name: 'surveys/teachers/teacher_end_of_year_survey',
        misc_form_path: 'csp_post_course',
        survey_data: {course: 'CS Principles', pd: false},
        allow_multiple_submissions: false
      },
      {
        form_name: 'surveys/teachers/teacher_end_of_year_survey',
        misc_form_path: 'csp_post_course_pd',
        survey_data: {course: 'CS Principles', pd: true},
        allow_multiple_submissions: false
      },
      {
        form_name: 'surveys/pd/csd_csp_facilitator_post_survey',
        misc_form_path: 'facilitator_post_survey',
        allow_multiple_submissions: true
      }
    ]
  end

  def self.find_form_data(misc_form_path)
    all_form_data.detect {|form_data| form_data[:misc_form_path] == misc_form_path}
  end

  def save_with_foorm_submission(answers, form_name, form_version)
    ActiveRecord::Base.transaction do
      create_foorm_submission!(form_name: form_name, form_version: form_version, answers: answers)
      save!
    end
  end

  def self.form_disabled?(misc_form_path)
    disabled_forms = DCDO.get('foorm_misc_survey_disabled', [])
    disabled_forms && disabled_forms.include?(misc_form_path)
  end
end
