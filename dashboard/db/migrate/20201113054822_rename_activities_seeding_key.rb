class RenameActivitiesSeedingKey < ActiveRecord::Migration[5.1]
  def change
    rename_column :lesson_activities, :seeding_key, :key
    rename_column :activity_sections, :seeding_key, :key
  end
end
