class AddSchoolYearToApSchoolCodes < ActiveRecord::Migration[5.0]
  def up
    add_column :ap_school_codes, :school_year, :integer, first: true

    # Need to remove foreign key before index can be removed
    # Readding foreign key once index is removed
    remove_foreign_key :ap_school_codes, :schools
    remove_index :ap_school_codes, :school_id
    add_foreign_key :ap_school_codes, :schools

    # New index created that is a composite
    # of school code and school year
    remove_index :ap_school_codes, :school_code
    add_index :ap_school_codes, [:school_code, :school_year], unique: true
  end

  def down
    remove_index :ap_school_codes, column: [:school_code, :school_year]

    remove_column :ap_school_codes, :school_year

    add_index :ap_school_codes, :school_code, unique: true
    add_index :ap_school_codes, :school_id, unique: true
  end
end
