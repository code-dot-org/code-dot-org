class AddGameChapter < ActiveRecord::Migration[4.2]
  def change
    add_column :script_levels, :game_chapter, :integer
  end
end
