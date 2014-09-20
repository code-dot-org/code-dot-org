class CreateLevels < ActiveRecord::Migration
  def change
    create_table :levels do |t|
      t.references :game
      t.string :name # for display
      t.string :level_url
      t.timestamps
    end
  end
end
