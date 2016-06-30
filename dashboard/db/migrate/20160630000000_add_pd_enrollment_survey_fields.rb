class AddPdEnrollmentSurveyFields < ActiveRecord::Migration
  def change
    add_column :pd_enrollments, :survey_sent_at, :datetime
    add_column :pd_enrollments, :survey_id, :integer

    # This index should have been here all along
    add_index :pd_enrollments, :code, unique: true
  end
end
