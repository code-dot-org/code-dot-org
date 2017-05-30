class CreateExperiments < ActiveRecord::Migration[5.0]
  def change
    create_table :experiments do |t|
      t.timestamps

      t.string :name, null: false
      t.string :type, null: false
      t.datetime :start_at
      t.datetime :end_at
      t.integer :section_id, index: true
      t.integer :min_user_id, index: true
      t.integer :max_user_id, index: true
      t.integer :overflow_max_user_id, index: true
      t.datetime :earliest_section_at
      t.datetime :latest_section_at
      t.integer :script_id
    end
  end
end
