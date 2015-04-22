class AddTimeZoneToSegments < ActiveRecord::Migration
  def change
    add_column :workshops, :time_zone, :string
  end
end
