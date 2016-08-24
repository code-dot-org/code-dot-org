class CreateHintViewRequests < ActiveRecord::Migration[4.2]
  def change
    create_table :hint_view_requests do |t|
      t.references :user, index: true, foreign_key: true
      t.integer :script_id
      t.integer :level_id
      t.integer :feedback_type
      t.text :feedback_xml

      t.timestamps null: false
    end

    add_index :hint_view_requests, [:script_id, :level_id]
  end
end
