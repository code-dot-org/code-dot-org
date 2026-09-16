class AddAuthenticationOptionIdAndEventTypeToSignIns < ActiveRecord::Migration[7.0]
  def change
    add_column :sign_ins, :authentication_option_id, :integer

    # event_type: Devise's trackable hook fires on any Warden set_user other than a session fetch, so sign_ins already
    # mixes credential sign-ins with remember-me cookies, the sign-in that follows registration, and programmatic
    # re-sign-ins (SessionsController#expire_other). It also holds rows for section-code students, who have no
    # authentication_option at all -- without this column a NULL authentication_option_id is unreadable.
    add_column :sign_ins, :event_type, :string, limit: 32
  end
end
