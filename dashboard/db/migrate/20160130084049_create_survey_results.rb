class CreateSurveyResults < ActiveRecord::Migration
  def change
    create_table :survey_results do |t|
      t.references :user, index: true, foreign_key: true
      t.text :properties, limit: 65535

      t.timestamps null: false
    end
  end
end
