# Adds an MD5 hash to Level objects to only import new level data when contents have changed.
class AddHashToLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :md5, :string
  end
end
