class AddIndexOnLevelToActivitiesAgain < ActiveRecord::Migration
  def up
    unless index_exists? :activities, :level_id
      add_index :activities, :level_id
    end
  end

  def down
    remove_index :activities, :level_id
  end
end
