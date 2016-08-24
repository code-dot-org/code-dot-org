class AddNotesToLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :notes, :text
  end
end
