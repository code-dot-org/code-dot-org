class CreateFoormSimpleSurveyForms < ActiveRecord::Migration[5.2]
  def change
    create_table :foorm_simple_survey_forms do |t|
      t.string  :path, null: false
      t.string  :kind
      t.string  :form_name, null: false
      t.integer :form_version
      t.text    :properties
      t.timestamps

      t.index :path
    end
  end
end
