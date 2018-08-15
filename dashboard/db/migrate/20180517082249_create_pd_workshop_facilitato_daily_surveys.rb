class CreatePdWorkshopFacilitatoDailySurveys < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_workshop_facilitator_daily_surveys do |t|
      t.integer :form_id, limit: 8, index: true, null: false
      t.integer :submission_id, limit: 8, index: {unique: true}, null: false
      t.references :user, null: false
      t.references :pd_session, null: true
      t.references :pd_workshop, null: false
      t.integer :facilitator_id, null: false
      t.text :form_data

      t.integer :day, :integer, index: true, null: false,
        comment: 'Day of the workshop (1-based)'

      # Only allow one submission per form per user per facilitator per day.
      t.index [:form_id, :user_id, :pd_session_id, :facilitator_id], unique: true,
        name: :index_pd_workshop_facilitator_daily_surveys_unique
    end
  end
end
