class AddIndexOnStateToSchoolDistricts < ActiveRecord::Migration[5.0]
  def change
    add_index :school_districts, :state
  end
end
