class AddNotesToLevels < ActiveRecord::Migration
  def change
    add_column :levels, :notes, :text
  end
end
