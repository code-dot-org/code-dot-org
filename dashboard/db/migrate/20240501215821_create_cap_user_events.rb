class CreateCAPUserEvents < ActiveRecord::Migration[6.1]
  def change
    create_table :cap_user_events do |t|
      t.string :name, null: false, limit: 64
      t.references :user, null: false, foreign_key: true, type: :integer, index: true
      t.string :policy, null: false, limit: 16

      t.timestamps
    end

    add_index :cap_user_events, [:name, :policy]
    add_index :cap_user_events, :policy
  end
end
