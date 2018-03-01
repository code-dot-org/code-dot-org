class AddAcceptedAtToPdApplications < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_applications, :accepted_at, :datetime
  end
end
