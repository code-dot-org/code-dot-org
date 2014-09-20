class AddSkinToLevels < ActiveRecord::Migration
  def change
    add_column :levels, :skin, :integer
  end
end
