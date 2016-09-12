class RemoveGameChapterFromScriptLevel < ActiveRecord::Migration[4.2]
  def change
    remove_column :script_levels, :game_chapter, :integer
  end
end
