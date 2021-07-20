class CreateBackpacks < ActiveRecord::Migration[5.2]
  def change
    create_table :backpacks do |t|
      t.integer :user_id, index: true, unique: true, null: false
      t.integer :channel_token_id, null: false

      t.timestamps
    end
  end
end
