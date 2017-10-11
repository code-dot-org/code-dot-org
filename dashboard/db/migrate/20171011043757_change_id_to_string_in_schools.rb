class ChangeIdToStringInSchools < ActiveRecord::Migration[5.0]
  def up
    remove_foreign_key :school_infos, :schools
    change_column :schools, :id, :string, limit: 12, comment: "NCES public school ID"
    change_column :school_infos, :school_id, :string, limit: 12
    add_foreign_key :school_infos, :schools
  end

  def down
    remove_foreign_key :school_infos, :schools
    change_column :schools, :id, :bigint, comment: "NCES public school ID"
    change_column :school_infos, :school_id, :bigint
    add_foreign_key :school_infos, :schools
  end
end
