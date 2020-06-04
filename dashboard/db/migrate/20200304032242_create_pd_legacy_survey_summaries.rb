class CreatePdLegacySurveySummaries < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_legacy_survey_summaries do |t|
      t.integer :facilitator_id
      t.string :course
      t.string :subject
      t.text :data

      t.timestamps
    end
  end
end
