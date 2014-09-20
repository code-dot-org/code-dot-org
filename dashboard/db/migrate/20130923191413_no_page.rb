class NoPage < ActiveRecord::Migration
  def change
    change_column :levels, :level_num, :string
    remove_column :levels, :page
  end
end
