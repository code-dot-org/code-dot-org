class AddIdToCohortsDistricts < ActiveRecord::Migration
  def change
    add_column :cohorts_districts, :id, :primary_key
  end
end
