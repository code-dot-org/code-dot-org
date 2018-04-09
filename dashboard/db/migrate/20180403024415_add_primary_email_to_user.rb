class AddPrimaryEmailToUser < ActiveRecord::Migration[5.0]
  def change
    add_reference :users, :primary_authentication_option, index: false
  end
end
