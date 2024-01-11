class CreateRecords < ActiveRecord::Migration[6.1]
  def change
    create_table :records, primary_key: [:channel_id, :table_name, :record_id] do |t|
      t.string :channel_id, limit: 22
      t.string :table_name, limit: 768
      t.integer :record_id
      t.json :json
    end
    add_index :records, [:channel_id, :table_name]
  end
end
