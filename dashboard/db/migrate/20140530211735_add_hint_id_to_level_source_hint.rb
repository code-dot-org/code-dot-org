class AddHintIdToLevelSourceHint < ActiveRecord::Migration[4.2]
  def change
    add_column :level_source_hints, :hint_id, :integer

    create_table :hints do |t|
      t.text :message, null: false

      t.timestamps
    end
  end
end
