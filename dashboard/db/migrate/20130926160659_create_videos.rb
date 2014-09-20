class CreateVideos < ActiveRecord::Migration
  def change
    create_table :videos do |t|
      t.string :name
      t.string :key
      t.string :youtube_code

      t.timestamps
    end

    add_column :concepts, :video_id, :integer
    add_column :games, :intro_video_id, :integer
    add_column :scripts, :wrapup_video_id, :integer
  end
end
