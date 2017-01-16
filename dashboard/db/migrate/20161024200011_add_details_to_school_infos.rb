class AddDetailsToSchoolInfos < ActiveRecord::Migration[5.0]
  def change
    add_column :school_infos, :country, :string, after: :id

    add_column :school_infos, :school_district_name, :string, after: :school_district_other

    # jump through hoops because schools.id is a bigint and was not auto-created by rails
    add_index :schools, :id, unique: true
    add_reference :school_infos, :school, limit: 8, foreign_key: true, after: :school_district_name

    add_column :school_infos, :school_other, :boolean, default: false, after: :school_id
    add_column :school_infos, :school_name, :string, after: :school_other, comment: 'This column appears to be '\
      'redundant with pd_enrollments.school and users.school, therefore validation rules must be used to ensure that '\
      'any user or enrollment with a school_info has its school name stored in the correct place.'
    add_column :school_infos, :full_address, :string, after: :school_name, comment: 'This column appears to be '\
      'redundant with users.full_address, therefore validation rules must be used to ensure that any user with a '\
      'school_info has its school address stored in the correct place.'
  end
end
