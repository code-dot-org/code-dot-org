class AddUserIdToPdApplications < ActiveRecord::Migration[5.0]
  def change
    add_reference :pd_applications, :user, after: :id, null: false, index: true
  end
end
