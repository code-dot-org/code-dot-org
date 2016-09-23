class CreateSchoolInfos < ActiveRecord::Migration[4.2]
  def up
    ActiveRecord::Base.transaction do
      create_table :school_infos do |t|
        t.string :school_type
        t.integer :zip
        t.string :state
        t.references :school_district, foreign_key: true
        t.boolean :school_district_other, default: false

        t.timestamps null: false
      end

      Pd::Enrollment.with_deleted.all.each do |e|
        attributes = {
          school_type: e.school_type,
          zip: e.school_zip,
          state: e.school_state,
          school_district_id: e.school_district_id,
          school_district_other: false
        }

        # Set district_other to true for all entries that should have had a school_district_id but didn't.
        if (attributes[:school_type] == SchoolInfo::SCHOOL_TYPE_PUBLIC ||
            attributes[:school_type] == SchoolInfo::SCHOOL_TYPE_CHARTER) &&
           (!attributes.blank? && attributes[:state] != SchoolInfo::SCHOOL_STATE_OTHER) &&
           attributes[:school_district_id].blank?
          attributes[:school_district_other] = true
        end

        SchoolInfo.where(attributes).first_or_create
      end

      add_reference(:pd_enrollments, :school_info)
    end
  end

  def down
    remove_reference(:pd_enrollments, :school_info)
    drop_table :school_infos
  end
end
