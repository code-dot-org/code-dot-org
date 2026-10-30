class AddLocationNameLocationAddressAndMeetingLinkToSessions < ActiveRecord::Migration[6.1]
  def change
    add_column :pd_sessions, :meeting_link, :text
    add_column :pd_sessions, :location_name, :string
    add_column :pd_sessions, :location_address, :string
  end
end
