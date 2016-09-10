class NoPage < ActiveRecord::Migration[4.2]
  def change
    change_column :levels, :level_num, :string
    remove_column :levels, :page
  end
end
