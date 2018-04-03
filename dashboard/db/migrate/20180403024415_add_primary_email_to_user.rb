class AddPrimaryEmailToUser < ActiveRecord::Migration[5.0]
  def change
    add_reference :users, :primary_email, index: false
  end
end
