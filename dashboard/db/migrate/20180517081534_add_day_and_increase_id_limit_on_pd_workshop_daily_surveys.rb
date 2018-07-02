class AddDayAndIncreaseIdLimitOnPdWorkshopDailySurveys < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_workshop_daily_surveys, :day, :integer, index: true, null: false,
      comment: 'Day of the workshop (1-based), or zero for the pre-workshop survey'

    reversible do |dir|
      dir.up do
        change_column :pd_workshop_daily_surveys, :form_id, :integer, limit: 8
        change_column :pd_workshop_daily_surveys, :submission_id, :integer, limit: 8
        remove_index :pd_workshop_daily_surveys, name: :index_pd_workshop_daily_surveys_on_user_form_day

        # Only allow one submission per [user, workshop, day, form] combo.
        add_index :pd_workshop_daily_surveys, [:user_id, :pd_workshop_id, :day, :form_id], unique: true,
          name: :index_pd_workshop_daily_surveys_on_user_workshop_day_form
      end
      dir.down do
        change_column :pd_workshop_daily_surveys, :form_id, :integer
        change_column :pd_workshop_daily_surveys, :submission_id, :integer

        remove_index :pd_workshop_daily_surveys, name: :index_pd_workshop_daily_surveys_on_user_form_day
        add_index :pd_workshop_daily_surveys, [:form_id, :user_id, :pd_session_id], unique: true,
          name: :index_pd_workshop_daily_surveys_on_user_form_day
      end
    end
  end
end
