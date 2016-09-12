class AddPageToLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :page, :integer
  end
end
