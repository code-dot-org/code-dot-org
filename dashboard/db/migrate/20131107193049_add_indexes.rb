class AddIndexes < ActiveRecord::Migration
  def change
    add_index :activities, :level_source_id if !index_exists?(:activities, :level_source_id)
    add_index :concepts, :video_id
    add_index :concepts_levels, :concept_id
    add_index :concepts_levels, :level_id
    add_index :followers, :section_id
    add_index :games, :intro_video_id
    add_index :levels, :game_id
    add_index :script_levels, :level_id
    add_index :script_levels, :script_id
    add_index :scripts, :wrapup_video_id
  end
end
