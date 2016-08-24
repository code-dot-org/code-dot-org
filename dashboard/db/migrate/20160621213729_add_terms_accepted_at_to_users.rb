class AddTermsAcceptedAtToUsers < ActiveRecord::Migration[4.2]
  def change
    # The terms_accepted_at column will store the most recent timestamp the user
    # explicitly accepted our Terms of Service.
    add_column :users, :terms_of_service_version, :integer
  end
end
