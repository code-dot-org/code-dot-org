class CreatePdApplicationsStatusLog < ActiveRecord::Migration[6.0]
  def change
    create_table :pd_applications_status_logs do |t|
      t.bigint :pd_application_id, null: false
      t.string :status, null: false
      t.datetime :timestamp, null: false
      t.integer :position, null: false
    end
  end
end
