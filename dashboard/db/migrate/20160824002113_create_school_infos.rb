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
    end
  end

  def down
    drop_table :school_infos
  end
end
