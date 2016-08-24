class AddTypeToLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :type, :string
  end
end
