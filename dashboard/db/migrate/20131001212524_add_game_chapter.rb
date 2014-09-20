class AddGameChapter < ActiveRecord::Migration
  def change
    add_column :script_levels, :game_chapter, :integer
  end
end
