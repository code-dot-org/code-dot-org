class ChangeSkinToString < ActiveRecord::Migration
  def change
    remove_column :levels, :skin
    add_column :levels, :skin, :string
  end
end
