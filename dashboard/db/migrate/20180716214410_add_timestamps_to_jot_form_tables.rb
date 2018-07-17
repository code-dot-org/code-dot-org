class AddTimestampsToJotFormTables < ActiveRecord::Migration[5.0]
  def change
    now = DateTime.now
    [
      :pd_workshop_daily_surveys,
      :pd_workshop_facilitator_daily_surveys,
      :pd_post_course_surveys
    ].each do |table_name|
      add_timestamps table_name, null: false, default: now

      reversible do |dir|
        dir.up do
          change_column_default table_name, :created_at, nil
          change_column_default table_name, :updated_at, nil
        end
      end
    end
  end
end
