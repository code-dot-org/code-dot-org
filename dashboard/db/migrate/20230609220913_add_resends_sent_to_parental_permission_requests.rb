class AddResendsSentToParentalPermissionRequests < ActiveRecord::Migration[6.1]
  def change
    add_column :parental_permission_requests, :resends_sent, :integer, default: 0, null: false
  end
end
