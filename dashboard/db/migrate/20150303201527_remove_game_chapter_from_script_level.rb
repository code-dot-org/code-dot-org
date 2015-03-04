class RemoveGameChapterFromScriptLevel < ActiveRecord::Migration
  def change
    remove_column :script_levels, :game_chapter, :integer
  end
end
