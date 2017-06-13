class CreatePdTeacherconSurvey < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_teachercon_surveys do |t|
      t.references :pd_enrollment, null: false, index: {unique: true}
      t.text :form_data, null: false

      t.timestamps null: false
    end
  end
end
