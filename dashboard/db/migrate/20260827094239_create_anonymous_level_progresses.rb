class CreateAnonymousLevelProgresses < ActiveRecord::Migration[7.0]
  def change
    create_table :anonymous_level_progresses do |t|
      t.string :stable_id, limit: 36, null: false

      t.belongs_to :script, type: :integer, null: false, index: false
      t.belongs_to :level, type: :integer, null: false, index: false

      t.belongs_to :unit_group, type: :integer, index: false
      t.belongs_to :level_source, index: false, unsigned: true
      t.belongs_to :user, type: :integer, index: false

      t.integer :attempts, null: false, default: 0
      t.integer :best_result
      t.boolean :submitted
      t.integer :time_spent
      t.text :properties

      t.timestamps

      t.index %i[stable_id script_id level_id], unique: true, name: :index_anonymous_level_progresses_on_unique_stable_script_level
    end
  end
end
