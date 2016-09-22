class AddSkinToLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :skin, :integer
  end
end
