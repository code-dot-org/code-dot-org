class CreateFoormSimpleSurveyForms < ActiveRecord::Migration[5.2]
  def change
    create_table :foorm_simple_survey_forms do |t|
      t.string  :path, index: {unique: true}, null: false
      t.string  :form_name, null: false
      t.integer :form_version
      t.text    :properties

      t.timestamps
    end
  end
end
