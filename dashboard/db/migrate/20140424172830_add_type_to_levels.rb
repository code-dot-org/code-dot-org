class AddTypeToLevels < ActiveRecord::Migration
  def change
    add_column :levels, :type, :string
  end
end
