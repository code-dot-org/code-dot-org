class RenameLevelTypeOnBlock < ActiveRecord::Migration[5.0]
  def change
    rename_column :blocks, :level_type, :pool
    change_column_null :blocks, :pool, false
    change_column_default :blocks, :pool, from: nil, to: ''
  end
end
