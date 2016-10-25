class AddDetailsToSchoolInfos < ActiveRecord::Migration[5.0]
  def change
    add_column :school_infos, :country, :string, after: :id

    add_column :school_infos, :school_district_name, :string, after: :school_district_other

    # jump through hoops because schools.id is a bigint and was not auto-created by rails
    add_index :schools, :id, unique: true
    add_reference :school_infos, :school, limit: 8, foreign_key: true, after: :school_district_name

    add_column :school_infos, :school_other, :boolean, default: false, after: :school_id
    add_column :school_infos, :school_name, :string, after: :school_other
    add_column :school_infos, :full_address, :string, after: :school_name
  end
end
