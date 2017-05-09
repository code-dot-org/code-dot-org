class CreatePdLocalSummerWorkshopSurvey < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_local_summer_workshop_surveys do |t|
      t.references :pd_enrollment, null: false, index: false
      t.text :form_data
      t.integer :day, null: false

      t.timestamps null: false
    end

    # index on user_id and new teachercon column. Give it a custom name, as the
    # default-generated one is longer than 64 characters
    add_index :pd_local_summer_workshop_surveys,
      [:pd_enrollment_id, :day],
      unique: true,
      name: :index_pd_ls_workshop_survey_on_pd_enrollment_id_and_day
  end
end
