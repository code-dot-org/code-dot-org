class AddPageToLevels < ActiveRecord::Migration
  def change
    add_column :levels, :page, :integer
  end
end
