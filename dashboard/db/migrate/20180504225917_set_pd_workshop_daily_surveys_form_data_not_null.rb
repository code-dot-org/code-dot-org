class SetPdWorkshopDailySurveysFormDataNotNull < ActiveRecord::Migration[5.0]
  def change
    change_column_null :pd_workshop_daily_surveys, :form_data, false
  end
end
