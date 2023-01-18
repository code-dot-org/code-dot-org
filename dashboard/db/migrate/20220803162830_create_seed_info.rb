class CreateSeedInfo < ActiveRecord::Migration[6.0]
  def change
    create_table :seed_info do |t|
      t.string :table, null: false
      t.datetime :mtime
      t.index [:table]
    end
  end
end
