class CreateActivityHints < ActiveRecord::Migration[4.2]
  def change
    create_table :activity_hints do |t|
      t.references :activity, index: true, null: false
      t.references :level_source_hint, index: true, null: false

      t.timestamps
    end
  end
end
