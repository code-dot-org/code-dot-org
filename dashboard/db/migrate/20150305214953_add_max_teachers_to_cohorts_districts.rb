class AddMaxTeachersToCohortsDistricts < ActiveRecord::Migration[4.2]
  def change
    add_column :cohorts_districts, :max_teachers, :integer
  end
end
