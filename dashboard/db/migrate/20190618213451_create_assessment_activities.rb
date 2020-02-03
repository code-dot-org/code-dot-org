class CreateAssessmentActivities < ActiveRecord::Migration[5.0]
  def change
    create_table :assessment_activities do |t|
      t.integer :user_id, null: false
      t.integer :level_id, null: false
      t.integer :script_id, null: false
      t.index [:user_id, :level_id, :script_id], name: :index_assessment_activities_on_user_and_level_and_script

      t.integer :level_source_id

      t.integer :attempt
      t.integer :test_result

      t.timestamps
    end
  end
end
