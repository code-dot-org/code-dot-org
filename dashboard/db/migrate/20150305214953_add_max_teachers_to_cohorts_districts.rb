class AddMaxTeachersToCohortsDistricts < ActiveRecord::Migration
  def change
    add_column :cohorts_districts, :max_teachers, :integer
  end
end
