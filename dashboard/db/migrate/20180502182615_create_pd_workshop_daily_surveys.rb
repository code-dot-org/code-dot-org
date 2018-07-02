class CreatePdWorkshopDailySurveys < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_workshop_daily_surveys do |t|
      t.integer :form_id, index: true, null: false
      t.integer :submission_id, index: {unique: true}, null: false
      t.references :user, null: false
      t.references :pd_session
      t.references :pd_workshop, null: false
      t.text :form_data

      # Only allow one submission per form per user per day.
      t.index [:form_id, :user_id, :pd_session_id], unique: true,
        name: :index_pd_workshop_daily_surveys_on_user_form_day
    end
  end
end
