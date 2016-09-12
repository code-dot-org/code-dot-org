class IncreaseWorkshopStringColumnLimits < ActiveRecord::Migration[4.2]
  def change
    change_column :workshops, :location, :string, limit: 1000
    change_column :workshops, :instructions, :string, limit: 1000
  end
end
