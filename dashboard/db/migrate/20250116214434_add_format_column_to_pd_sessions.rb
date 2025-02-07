class AddFormatColumnToPdSessions < ActiveRecord::Migration[6.1]
  def change
    add_column :pd_sessions, :session_format, :integer
  end
end
