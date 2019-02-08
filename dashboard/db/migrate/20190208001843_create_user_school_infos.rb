class CreateUserSchoolInfos < ActiveRecord::Migration[5.0]
  def change
    create_table :user_school_infos do |t|
      t.integer  :user_id
      t.datetime :start_date
      t.datetime :end_date
      t.integer  :school_info_id
      t.datetime :last_confirmation_date

      t.timestamps
    end
  end
end
