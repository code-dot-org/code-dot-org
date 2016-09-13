class AddIdToCohortsDistricts < ActiveRecord::Migration[4.2]
  def change
    add_column :cohorts_districts, :id, :primary_key
  end
end
