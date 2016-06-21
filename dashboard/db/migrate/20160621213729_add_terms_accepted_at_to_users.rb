class AddTermsAcceptedAtToUsers < ActiveRecord::Migration
  def change
    # The terms_accepted_at column will store the most recent timestamp the user
    # explicitly accepted our Terms of Service.
    add_column :users, :terms_accepted_at, :datetime
  end
end
