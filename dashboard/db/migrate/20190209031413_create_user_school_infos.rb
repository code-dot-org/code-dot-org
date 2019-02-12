class CreateUserSchoolInfos < ActiveRecord::Migration[5.0]
  def change
    create_table :user_school_infos do |t|
      t.integer  :user_id, null: false
      t.datetime :start_date, null: false
      t.datetime :end_date
      t.integer  :school_info_id, null: false
      t.datetime :last_confirmation_date, null: false

      t.timestamps
    end
  end
end
