class UpdateSizeOfProperties < ActiveRecord::Migration[5.0]
  def up
    change_column :activity_sections, :properties, :text, limit: 65535
    change_column :lesson_activities, :properties, :text, limit: 65535
  end

  def down
    change_column :activity_sections, :properties, :string, limit: 255
    change_column :lesson_activities, :properties, :string, limit: 255
  end
end
