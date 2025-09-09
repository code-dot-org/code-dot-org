class AddTimeZoneColumnToPdSessions < ActiveRecord::Migration[6.1]
  def change
    add_column :pd_sessions, :time_zone, :string
  end
end
