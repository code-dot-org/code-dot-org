class CreatePlpTable < ActiveRecord::Migration
  def change
    create_table :plps do |t|
      t.string :name, null: false, index: true, unique: true
      t.references :contact, null: false
      t.boolean :urban
    end
  end
end
