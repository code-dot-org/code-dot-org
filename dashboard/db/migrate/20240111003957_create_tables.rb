class CreateTables < ActiveRecord::Migration[6.1]
  def change
    create_table :tables, primary_key: [:channel_id, :table_name] do |t|
      t.string :channel_id, limit: 22
      t.string :table_name, limit: 768
      t.json :columns
      t.string :is_shared_table, limit: 768

      t.timestamps
    end
  end
end
