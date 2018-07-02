class RenameFormDataToAnswersInJotFormTables < ActiveRecord::Migration[5.0]
  def change
    rename_column :pd_workshop_daily_surveys, :form_data, :answers
    rename_column :pd_workshop_facilitator_daily_surveys, :form_data, :answers

    # This column was added by accident
    remove_column :pd_workshop_facilitator_daily_surveys, :integer, :integer
  end
end
