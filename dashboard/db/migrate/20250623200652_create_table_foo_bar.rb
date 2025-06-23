class CreateTableFooBar < ActiveRecord::Migration[6.1]
  def change
    create_table :table_foo_bars do |t|
      t.timestamps
      t.boolean :flag
    end
  end
end
