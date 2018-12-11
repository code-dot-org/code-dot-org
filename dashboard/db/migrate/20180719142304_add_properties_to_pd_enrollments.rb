class AddPropertiesToPdEnrollments < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_enrollments, :properties, :text
  end
end
