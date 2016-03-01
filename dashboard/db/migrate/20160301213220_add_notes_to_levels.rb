class AddNotesToLevels < ActiveRecord::Migration
  def change
    add_column :levels, :notes, :string
  end
end
