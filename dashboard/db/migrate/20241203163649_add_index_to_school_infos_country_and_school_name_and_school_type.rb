class AddIndexToSchoolInfosCountryAndSchoolNameAndSchoolType < ActiveRecord::Migration[6.1]
  def change
    add_index :school_infos, [:school_name, :country, :school_type]
  end
end
