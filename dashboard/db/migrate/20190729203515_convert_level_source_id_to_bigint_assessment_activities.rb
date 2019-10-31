class ConvertLevelSourceIdToBigintAssessmentActivities < ActiveRecord::Migration[5.0]
  def up
    change_column :assessment_activities, :level_source_id, 'BIGINT(11) UNSIGNED'
  end

  def down
    change_column :assessment_activities, :level_source_id, :int
  end
end
