class AddHintIdToLevelSourceHint < ActiveRecord::Migration
  def change
    add_column :level_source_hints, :hint_id, :integer

    create_table :hints do |t|
      t.text :message, null: false

      t.timestamps
    end
  end
end
