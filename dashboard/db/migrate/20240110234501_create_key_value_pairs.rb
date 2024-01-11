class CreateKeyValuePairs < ActiveRecord::Migration[6.1]
  def change
    create_table :key_value_pairs, primary_key: [:channel_id, :key] do |t|
      t.string :channel_id, limit: 22
      t.string :key, limit: 768
      t.string :value, limit: 4096
    end
  end
end
