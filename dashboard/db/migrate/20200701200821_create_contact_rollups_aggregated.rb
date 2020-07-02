class CreateContactRollupsAggregated < ActiveRecord::Migration[5.0]
  def change
    create_table :contact_rollups_aggregated do |t|
      t.string :email, null: false
      t.string :data
      t.datetime :data_updated_at, null: false
      t.bool :failed_to_process
      t.timestamps
    end
  end
end
