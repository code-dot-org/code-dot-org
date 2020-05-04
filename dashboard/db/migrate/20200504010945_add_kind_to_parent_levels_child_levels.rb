class AddKindToParentLevelsChildLevels < ActiveRecord::Migration[5.0]
  def change
    add_column :parent_levels_child_levels, :kind, :string
  end
end
