class RemoveEmptyColumnsFromUser < ActiveRecord::Migration[4.2]
  def up
    change_table :users do |t|
      t.remove :address, :city, :state, :zip, :lat, :lon
    end
  end

  def down
    change_table :users do |t|
      # copied from schema.rb
      t.string   "address"
      t.string   "city"
      t.string   "state"
      t.string   "zip"
      t.float    "lat"
      t.float    "lon"
    end
  end
end
