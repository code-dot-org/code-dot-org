class AddKindToParentLevelsChildLevels < ActiveRecord::Migration[5.0]
  def change
    add_column :parent_levels_child_levels, :kind, :string, null: false, default: 'sublevel'
  end
end
