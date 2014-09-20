class CreateCallouts < ActiveRecord::Migration
  def change
    create_table :callouts do |t|
      t.string :element_id, null: false, limit: 1024
      t.string :text, null: false, limit: 1024

      t.timestamps
    end
  end
end
