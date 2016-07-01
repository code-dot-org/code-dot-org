class AddPdEnrollmentSurveyFields < ActiveRecord::Migration
  def change
    # Set when the exit survey email, containing the survey link, is sent.
    # Note the survey url is keyed on the enrollment code: code.org/pd-workshop-survey/{code}
    add_column :pd_enrollments, :survey_sent_at, :datetime

    # Set once a survey response is completed and processed.
    add_column :pd_enrollments, :completed_survey_id, :integer
  end
end
