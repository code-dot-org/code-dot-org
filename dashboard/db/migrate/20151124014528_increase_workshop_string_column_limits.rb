class IncreaseWorkshopStringColumnLimits < ActiveRecord::Migration
  def change
    change_column :workshops, :location, :string, limit: 1000
    change_column :workshops, :instructions, :string, limit: 1000
  end
end
