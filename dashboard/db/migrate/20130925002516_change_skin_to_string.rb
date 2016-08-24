class ChangeSkinToString < ActiveRecord::Migration[4.2]
  def change
    remove_column :levels, :skin
    add_column :levels, :skin, :string
  end
end
