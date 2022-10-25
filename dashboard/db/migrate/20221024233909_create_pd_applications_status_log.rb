class CreatePdApplicationsStatusLog < ActiveRecord::Migration[6.0]
  def change
    create_table :pd_applications_status_logs do |t|
      t.integer :pd_application_id, null: false
      t.string :status, null: false
      t.timestamp :timestamp, null: false
      t.integer :position, null: false
    end
  end
end
